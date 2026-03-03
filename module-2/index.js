import tf from '@tensorflow/tfjs-node';

// Exemplo de pessoas para treino (cada pessoa com idade, cor e localização)
// const pessoas = [
//     { nome: "Amanda", idade: 30, cor: "azul", localizacao: "São Paulo" },
//     { nome: "Ana", idade: 25, cor: "vermelho", localizacao: "Rio" },
//     { nome: "Carlos", idade: 40, cor: "verde", localizacao: "Curitiba" }
// ];

// Vetores de entrada com valores já normalizados - (idade - idade_min)/(idade_max - idade_min)
// e one-hot encoded
// Ordem: [idade_normalizada, azul, vermelho, verde, São Paulo, Rio, Curitiba]
const tensorPessoasNormalizado = [
    [0.33, 1, 0, 0, 1, 0, 0], // Amanda - 30, cor azul: 1, cor vermelho: 0, cor verde: 0, localização São Paulo: 1, Rio: 0, Curitiba: 0
    [0, 0, 1, 0, 0, 1, 0],    // Ana - 25, cor azul: 0, cor vermelho: 1, cor verde: 0, localização São Paulo: 0, Rio: 1, Curitiba: 0
    [1, 0, 0, 1, 0, 0, 1]     // Carlos - 40, cor azul: 0, cor vermelho: 0, cor verde: 1, localização São Paulo: 0, Rio: 0, Curitiba: 1
]


// const test pessoa = { nome: "Manu", idade: 28, cor: "verde", localizacao: "Curitiba" }
// deve dar basic pq eh mais parecido com o Carlos
const testePessoaTensorNormalizada = [
    [0.2, 0, 0, 1, 0, 0, 1] 
]


// Labels das categorias a serem previstas (one-hot encoded)
// [premium, medium, basic]
const labelsNomes = ["premium", "medium", "basic"]; // Ordem dos labels
const tensorLabels = [
    [1, 0, 0], // premium - Amanda
    [0, 1, 0], // medium - Ana
    [0, 0, 1]  // basic - Carlos
];

// Criamos tensores de entrada (xs) e saída (ys) para treinar o modelo
const inputXs = tf.tensor2d(tensorPessoasNormalizado)
const outputYs = tf.tensor2d(tensorLabels)

inputXs.print();
outputYs.print();

const model = await trainModel(inputXs, outputYs);

async function trainModel(inputXs, outputYs) {
    // Criamos um modelo sequencial
    const model = tf.sequential();

    // Primeira camada da rede: entrada de 7 posicoes (idade + 3 cores + 3 localizações)
    // qts mais neuronios, mais complexidade a rede pode aprender e mais processamento ela usa
    // a relu age como um filtro, deixando passar apenas os valores positivos, o que ajuda a rede a aprender padrões mais complexos
    model.add(tf.layers.dense({ inputShape: [7], units: 80, activation: 'relu' }));

    //Saida: 3 neuronios (pq tem 3 categorias - premium, medium, basic) e a softmax transforma os valores de saída em probabilidades, ou seja, a soma das saídas será igual a 1, facilitando a interpretação dos resultados.
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

    model.compile({
        optimizer: 'adam', // adaptive moment estimation - Otimizador que ajusta os pesos da rede para minimizar a perda, aprende com o historico de erros e acertos.
        loss: 'categoricalCrossentropy', // compara os scores de cada categoria com a resposta certa, penalizando mais os erros graves, o que ajuda a rede a aprender melhor.
        metrics: ['accuracy'] // Métrica para avaliar o desempenho do modelo (qto mais distante da previsao correta, maior o erro/loss)
    });

    //treinamento do modelo
    await model.fit(inputXs, outputYs, {
        verbose: 0,
        epochs: 100, // Quantidade de vezes que o modelo vai passar por todo o dataset de treino, quanto mais epochs, mais o modelo pode aprender, mas cuidado com overfitting (quando o modelo aprende tão bem os dados de treino que não generaliza bem para novos dados)
        shuffle: true, // Embaralha os dados a cada época para evitar que o modelo aprenda padrões específicos da ordem dos dados,
        // callbacks: {
        //     onEpochEnd: (epoch, logs) => {
        //         console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        //     }
        // }
    });

    return model;

}

async function predict(model, testePessoaTensorNormalizada) {
    // Previsão para a nova pessoa (Manu)
    const novaPessoaTensor = tf.tensor2d(testePessoaTensorNormalizada); //transforma o array 2d pra um tensor 2d, que é o formato esperado pelo modelo para fazer previsões
    const previsao = model.predict(novaPessoaTensor);
    const predArray = await previsao.array(); // converte o tensor de previsão para um array JavaScript
    console.log("Previsão:", predArray);
    return predArray[0].map((prob, index) => ({prob, index}));

}

const predictions = await predict(model, testePessoaTensorNormalizada);
const results = predictions.sort((a, b) => b.prob - a.prob).map(pred => ({
    categoria: labelsNomes[pred.index],
    probabilidade: pred.prob
}));

console.log("Resultados ordenados por probabilidade:");
console.log(results);

