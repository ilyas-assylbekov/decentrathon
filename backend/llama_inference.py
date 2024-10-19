import sys
import subprocess
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import sentencepiece
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

def main(query):
    # Automate Hugging Face CLI login
    hf_token = os.getenv('HF_TOKEN')
    if hf_token:
        subprocess.run(['huggingface-cli', 'login', '--token', hf_token, '--add-to-git-credential'], check=True)

    model_name = "meta-llama/Llama-3.2-1B"  # Adjust the model name as needed
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)

    print("Query:", query)

    inputs = tokenizer(query, return_tensors="pt")
    outputs = model.generate(inputs.input_ids, max_length=100)
    response = tokenizer.batch_decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]
    print(response)

if __name__ == "__main__":
    query = sys.argv[1]
    main(query)