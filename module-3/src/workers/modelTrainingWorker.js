import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

console.log('Model training worker initialized');
let _globalCtx = {};
let _model = null

// category is the most important to match and so on
const WEIGHTS = {
    category: 0.4,
    color: 0.3,
    price: 0.2,
    age: 0.1
}

//normalize to work between 0 - 1 
const normalize = (value, min, max) => (value - min) / (max - min);

// one hot encoding with weight, so we can give more importance to some features in the recommendation
const oneHotWeighted = (index, length, weight) => tf.oneHot(index, length).cast('float32').mul(weight);

//normalizing data from 0 to 1 to apply weight in the reocmmendation
 function encodeProduct(product, ctx) {
    
    const price = tf.tensor1d(
        [normalize(product.price, ctx.minPrice, ctx.maxPrice) * WEIGHTS.price]
    ); // normalize price

    

    const age = tf.tensor1d([
        (ctx.productAvgAgeNorm[product.name] ?? 0.5) * WEIGHTS.age
    ])

    

    const category = oneHotWeighted(
        ctx.categoryIndex[product.category], 
        ctx.numCategories, 
        WEIGHTS.category
    );

    

    const colors = oneHotWeighted(
        ctx.colorIndex[product.color], 
        ctx.numColors, 
        WEIGHTS.color
    );

    return tf.concat1d([price, age, category, colors]);
}

function encodeUser(user, ctx) {
    // encode user preferences into a vector
    
    if (user.purchases.length) {
        return tf.stack(
            user.purchases.map(
                product => encodeProduct(product, ctx)
                
            )
            
        )
            .mean(0)
            .reshape([
                1,
                ctx.dimensions
            ])
    }
    
    return tf.concat1d(
        [
            tf.zeros([1]), // price is ignored for user, as we are not encoding a specific product
            tf.tensor1d([
                normalize(user.age, ctx.minAge, ctx.maxAge)
                * WEIGHTS.age
            ]),
            tf.zeros([ctx.numCategories]), // categoria ignorada,
            tf.zeros([ctx.numColors]), // color ignorada,

        ]
    ).reshape([1, ctx.dimensions])

}

function createTrainingData(ctx) {
    const inputs = []
    const labels = []
    ctx.users
    .filter(u => u.purchases.length)
    .forEach(user => {
        const userVector = encodeUser(user, ctx).dataSync(); // convert tensor to array for easier handling later
        ctx.catalog.forEach(product => {
            // checks if user has purchased the product, if yes label is 1, if not label is 0
            const productVector = encodeProduct(product, ctx).dataSync() 
             const label = user.purchases.some(
                purchase => purchase.name === product.name ? 1: 0
             )
             // combinar user + product
            inputs.push([...userVector, ...productVector])
            labels.push(label)
            
        })
    })
    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),// reshape labels to be a column vector
        inputDimension: ctx.dimensions * 2
        // size = userVector + productVector
    }
}

// ====================================================================
// 📌 Example of a user BEFORE encoded
// ====================================================================
/*
const exampleUser = {
    id: 201,
    name: 'Rafael Souza',
    age: 27,
    purchases: [
        { id: 8, name: 'Boné Estiloso', category: 'acessórios', price: 39.99, color: 'preto' },
        { id: 9, name: 'Mochila Executiva', category: 'acessórios', price: 159.99, color: 'cinza' }
    ]
};
*/

// ====================================================================
// 📌 After encoding, the model does not see names or words.
// It sees a NUMERIC VECTOR (all normalized between 0–1).
// Example: [price_normalized, age_normalized, cat_one_hot..., color_one_hot...]
//
// Assume categories = ['acessórios', 'eletrônicos', 'vestuário']
// Assume colors      = ['preto', 'cinza', 'azul']
//
// For Rafael (idade 27, category: acessorios, cores: black/gray),
// the vector could look like this:
//
// [
//   0.45,            // weight of normalized price
//   0.60,            // normalized age
//   1, 0, 0,         // one-hot encoding of category (accessories = active)
//   1, 0, 0          // one-hot encoding of colors (black and gray active, blue inactive)
// ]
//
// Those number are sent to the neural network.
// ====================================================================

// ====================================================================
// 🧠 Configuration and training of neural network
// ====================================================================

async function configureNeuralNetAndTrain(trainData) {

    const model = tf.sequential()
    // Entry layer
    // - inputShape: number of features per training example (trainData.inputDim)
    //   Example: If the product + user vector = 20 numbers, then inputDim = 20
    // - units: 128 neurons (many "eyes" to detect patterns)
    // - activation: 'relu' (keeps only positive signals, helps learn non-linear patterns)
    model.add(
        tf.layers.dense({
            inputShape: [trainData.inputDimension],
            units: 128,
            activation: 'relu'
        })
    )
    // Hidden layer 1
    // - 64 neurons (fewer than the first layer: starts compressing information)
    // - activation: 'relu' (still extracting relevant combinations of features)
    model.add(
        tf.layers.dense({
            units: 64,
            activation: 'relu'
        })
    )

    // Hidden layer 2
    // - 32 neurons (narrower than the previous layer, distilling the most important information)
    //   Example: Of many signals, keeps only the strongest patterns
    // - activation: 'relu'
    model.add(
        tf.layers.dense({
            units: 32,
            activation: 'relu'
        })
    )
    // Output layer
    // - 1 neuron because we will return only a recommendation score
    // - activation: 'sigmoid' compresses the result to the range 0–1
    //   Example: 0.9 = recommendation strong, 0.1 = recommendation weak
    model.add(
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
    )

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    })

    await model.fit(trainData.xs, trainData.ys, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch,
                    loss: logs.loss,
                    accuracy: logs.acc
                });
            }
        }
    })

    return model
}


function makeContext(catalog, users) {
    // normalize data
    const ages = users.map(u => u.age);
    const prices = catalog.map(p => p.price);
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    //make set to remove duplicates
    const colors = [...new Set(catalog.map(u => u.color))];
    const categories = [...new Set(catalog.map(p => p.category))];

    const colorIndex = Object.fromEntries(colors.map((color, index) => {
        return [color, index]
    }))

    const categoryIndex = Object.fromEntries(categories.map((category, index) => {
        return [category, index]
    }))

    //compute median age of users
    const medianAge = (minAge + maxAge) / 2;
    const ageSums = {}
    const ageCounts = {}

    users.forEach(user => {
        user.purchases.forEach(p => {
            ageSums[p.name] = (ageSums[p.name] || 0) + user.age;
            ageCounts[p.name] = (ageCounts[p.name] || 0) + 1;
        })
    });

    const productAvgAgeNorm = Object.fromEntries(
        catalog.map(product => {
            const avgAge = ageCounts[product.name] ? ageSums[product.name] / ageCounts[product.name] : medianAge;
            return [product.name, normalize(avgAge, minAge, maxAge)];
        })
    )

    return {
        catalog,
        users,
        colorIndex,
        categoryIndex,
        minAge,
        maxAge,
        minPrice,
        maxPrice,
        numCategories: categories.length,
        numColors: colors.length,
        // price + age + colors + categories
        dimensions: 2 + categories.length + colors.length, // age + price + one-hot categories + one-hot colors
        productAvgAgeNorm
    }
}
    

//sequencial because we add many layers one after the other, and each layer has a specific function in the learning process. The first layer is responsible for learning simple patterns in the data, while the subsequent layers learn more complex patterns based on the outputs of the previous layers. This hierarchical structure allows the model to capture intricate relationships in the data, which is essential for making accurate predictions.



async function trainModel({ users }) {
    console.log('Training model with users:', users)

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 50 } });

    // load product data
    const catalog = await (await fetch('/data/products.json')).json();

    const context = makeContext(catalog, users)
    context.productVectors = catalog.map(product => {
        return {
            name: product.name,
            meta: {...product},
            vector: encodeProduct(product, context).dataSync() // convert tensor to array for easier handling later
        }
    })

    _globalCtx = context


    const trainData = createTrainingData(context)

     _model = await configureNeuralNetAndTrain(trainData)

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });

}
function recommend({ user }) {
    console.log('will recommend for user:', user)
    if (!_model) return;
    const context = _globalCtx
    // 1️⃣ Convert the user's preferences into a vector using the same encoding as the training data.
    //    (ignore price, age normalized, categories ignored)
    //    This transforms the user's information into the same numerical format
    //    that was used to train the model.

    const userVector = encodeUser(user, context).dataSync()

    // In real applications:
    //  Store all product vectors in a vector database (e.g., Postgres, Neo4j or Pinecone)
    //  Query: Find the 200 most similar products to the user's vector
    //  Execute _model.predict() only on these products to save processing time.

    // 2️⃣ Create entry pairs: for each product, concatenate the user's vector
    //    with the encoded product vector.
    //    Why? The model predicts the "compatibility score" for each pair (user, product).


    const inputs = context.productVectors.map(({ vector }) => {
        return [...userVector, ...vector]
    })

    // 3️⃣ Convert those pairs into a single Tensor.
    //    Format: [numProducts, inputDim]
    const inputTensor = tf.tensor2d(inputs)

    // 4️⃣ Run the trained neural network on all (user, product) pairs at once.
    //    The result is a score for each product between 0 and 1.
    //    Bigger scores, better the recommendation for that user.
    const predictions = _model.predict(inputTensor)

    // 5️⃣ Extract the scores into a normal JS array.
    const scores = predictions.dataSync()

    const recommendations = context.productVectors.map((item, index) => {
        return {
            ...item.meta,
            name: item.name,
            score: scores[index]
        }
    })

    const sortedItems = recommendations
        .sort((a, b) => b.score - a.score)

    // 8️⃣ Send the sorted list of recommended products
    //    to the main thread (the UI can display them now).
    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations: sortedItems
    });

}


const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: recommend,
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
