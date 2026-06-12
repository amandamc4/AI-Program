export class AIService {
  constructor() {
    this.session = null;
    this.abortController = null;
  }

  async checkRequirements() {
    const errors = [];

    // @ts-ignore
    const isChrome = !!window.chrome;
    if (!isChrome) {
      errors.push(
        "⚠️ This feature only works in Google Chrome or Chrome Canary (recent version).",
      );
    }

    if (!("LanguageModel" in self)) {
      errors.push("⚠️ The native AI APIs are not active.");
      errors.push("Activate the following flag in chrome://flags/:");
      errors.push(
        "- Prompt API for Gemini Nano (chrome://flags/#prompt-api-for-gemini-nano)",
      );
      errors.push("After, restart Chrome and try again.");
      return errors;
    }

    // Check Translator availability
    if ("Translator" in self) {
      const translatorAvailability = await Translator.availability({
        sourceLanguage: "en",
        targetLanguage: "pt",
      });
      console.log("Translator Availability:", translatorAvailability);

      if (translatorAvailability === "no") {
        errors.push("⚠️ Translation is not available.");
      }
    } else {
      errors.push("⚠️ The Translation API is not active.");
      errors.push("Activate the following flag in chrome://flags/:");
      errors.push("- Translation API (chrome://flags/#translation-api)");
    }

    // Check Language Detection API
    if (!("LanguageDetector" in self)) {
      errors.push("⚠️ The Language Detection API is not active.");
      errors.push("Activate the following flag in chrome://flags/:");
      errors.push(
        "- Language Detection API (chrome://flags/#language-detector-api)",
      );
    }

    if (errors.length > 0) {
      return errors;
    }

    const availability = await LanguageModel.availability({
      languages: ["en"],
    });
    console.log("Language Model Availability:", availability);
    console.log("LanguageModel Object:", LanguageModel);

    if (availability === "available") {
      return null;
    }

    if (availability === "unavailable") {
      errors.push(`⚠️ Your device does not support native AI language models.`);
    }

    if (availability === "downloading") {
      errors.push(
        `⚠️ The AI language model is being downloaded. Please wait a few minutes and try again.`,
      );
    }

    if (availability === "downloadable") {
      errors.push(
        `⚠️ The AI language model needs to be downloaded, downloading now... (monitor the progress in the chrome terminal)`,
      );
      try {
        const session = await LanguageModel.create({
          expectedInputLanguages: ["en"],
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              const percent = ((e.loaded / e.total) * 100).toFixed(0);
              console.log(`Downloaded ${percent}%`);
            });
          },
        });
        await session.prompt("Hello");
        session.destroy();

        // Re-check availability after download
        const newAvailability = await LanguageModel.availability({
          languages: ["en"],
        });
        if (newAvailability === "available") {
          return null; // Download successful
        }
      } catch (error) {
        console.error("Error downloading model:", error);
        errors.push(`⚠️ Error downloading model: ${error.message}`);
      }
    }
    return errors.length > 0 ? errors : null;
  }

  async downloadModel(onProgress) {
    try {
      const session = await LanguageModel.create({
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            const percent = ((e.loaded / e.total) * 100).toFixed(0);
            if (onProgress) onProgress(percent);
          });
        },
      });
      // "Acorda" o modelo para garantir a instalação
      await session.prompt("hello");
      session.destroy();
      return true;
    } catch (error) {
      console.error("Error in downloadModel:", error);
      throw error;
    }
  }

  async getParams() {
    const params = await LanguageModel.params();
    console.log("Language Model Params:", params);
    return params;
  }

  async *createSession(question, temperature, topK, file = null) {
    this.abortController?.abort();
    this.abortController = new AbortController();

    // Destroy previous session and create new one with updated parameters
    if (this.session) {
      this.session.destroy();
    }

    this.session = await LanguageModel.create({
      expectedInputs: [
        { type: "text", languages: ["en"] },
        { type: "audio" },
        { type: "image" },
      ],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
      temperature: temperature,
      topK: topK,
      initialPrompts: [
        {
          role: "system",
          content: [
            {
              type: "text",
              value: `You are an AI assistant that responds clearly and objectively.
                        Always respond in plain text format instead of markdown.`,
            },
          ],
        },
      ],
    });

    // Build content array with text and optional file
    const contentArray = [{ type: "text", value: question }];

    if (file) {
      const fileType = file.type.split("/")[0];
      if (fileType === "image" || fileType === "audio") {
        // Convert file to blob for proper handling
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        contentArray.push({ type: fileType, value: blob });
        console.log(`Adding ${fileType} to prompt:`, file.name);
      }
    }

    const responseStream = await this.session.promptStreaming(
      [
        {
          role: "user",
          content: contentArray,
        },
      ],
      {
        signal: this.abortController.signal,
      },
    );

    for await (const chunk of responseStream) {
      if (this.abortController.signal.aborted) {
        break;
      }
      yield chunk;
    }
  }

  abort() {
    this.abortController?.abort();
  }

  isAborted() {
    return this.abortController?.signal.aborted;
  }
}
