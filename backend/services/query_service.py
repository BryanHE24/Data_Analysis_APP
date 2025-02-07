import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def process_query(df, query):
    data_string = df.to_string()
    prompt = f"You are a data analysis assistant. Analyze the following data:\n\n{data_string}\n\nUser Query: {query}\n\nResponse:"
    
    response = model.generate_content(prompt)
    return response.text
