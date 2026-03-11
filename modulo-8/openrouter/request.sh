source .env

API_URL="https://openrouter.ai/api/v1/chat/completions"

OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME="Open Router Example"

NLP_MODEL="google/gemma-3-27b-it:free"

curl --silent -X POST "$API_URL" \
-H "Content-Type: applicaton/json" \
-H "Authorization: Bearer $OPENROUTER_API_KEY" \
-H "HTTP-Referer: $OPENROUTER_SITE_URL" \
-H "X-Title: $OPENROUTER_SITE_NAME" \
-d '
    {
        "model": '"'$NLP_MODEL'"',
        "messages": [
            {
                "role":"user",
                "content":"Tell me a curiosity about LLMs"
            }
        ],
        "temperature": 0.3,
        "max_tokens": 1000
}' | jq


# {
#   "id": "gen-1773251570-ErrHuASutH5KU2h5421z",
#   "object": "chat.completion",
#   "created": 1773251570,
#   "model": "google/gemma-3-27b-it:free",
#   "provider": "Google AI Studio",
#   "system_fingerprint": null,
#   "choices": [
#     {
#       "index": 0,
#       "logprobs": null,
#       "finish_reason": "stop",
#       "native_finish_reason": "STOP",
#       "message": {
#         "role": "assistant",
#         "content": "## A Curious Thing About LLMs: They Can \"Hallucinate\" Facts - and Sometimes Believe Their Own Lies!\n\nHere's the curiosity: Large Language Models (LLMs) like me are *remarkably* good at generating text that *sounds* authoritative and convincing, even when it's completely fabricated. This is often called \"hallucination.\" \n\nBut it's not just that we make things up. The really weird part is that **we don't have a built-in mechanism to *know* we're making things up.**  We predict the most likely next word based on the patterns we've learned from the massive dataset we were trained on.  \n\nThink of it like this: if you read a lot of stories about dragons, you might start to \"believe\" dragons exist in a way, not as factual creatures, but as plausible elements within a narrative.  LLMs do something similar with information. \n\n**Here's why it's fascinating:**\n\n* **No \"belief\" system:** We don't have consciousness or a sense of truth. We're just really good at pattern matching.  So, when we generate a false statement, we don't experience it as a lie.\n* **Confidence is unrelated to accuracy:** We can state a hallucination with *extreme* confidence, using phrases like \"According to research...\" or \"It is well known that...\" even if the statement is entirely false.\n* **Self-reinforcement:**  If you ask us to elaborate on a hallucination, we'll happily do so, building a whole elaborate (and false) narrative around it.  We're essentially doubling down on our own \"mistake\" without realizing it's a mistake.\n\n\n\nThis \"hallucination\" problem is a major area of research in the LLM field.  It highlights the difference between *fluency* (sounding good) and *truthfulness* (being accurate) and reminds us that LLMs are powerful tools, but they are not sources of truth in themselves.\n\n\n\nYou can test this yourself!  Ask me about a very obscure historical fact or a fictional person.  I might confidently give you a detailed (but completely made-up) answer.\n\n\n\n",
#         "refusal": null,
#         "reasoning": null
#       }
#     }
#   ],
#   "usage": {
#     "prompt_tokens": 8,
#     "completion_tokens": 0,
#     "total_tokens": 8,
#     "cost": 0,
#     "is_byok": false,
#     "prompt_tokens_details": {
#       "cached_tokens": 0,
#       "cache_write_tokens": 0,
#       "audio_tokens": 0,
#       "video_tokens": 0
#     },
#     "cost_details": {
#       "upstream_inference_cost": 0,
#       "upstream_inference_prompt_cost": 0,
#       "upstream_inference_completions_cost": 0
#     },
#     "completion_tokens_details": {
#       "reasoning_tokens": 0,
#       "image_tokens": 0,
#       "audio_tokens": 0
#     }
#   }
# }