import streamlit as st
import wikipedia
from datetime import datetime
from openai import OpenAI

# === CONFIG ===
OWNER_NAME = "Adhyan Sarthak"
BOT_NAME = "Shul"

# Streamlit Sidebar for Security
st.sidebar.title("Shul Settings")
user_api_key = st.sidebar.text_input("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", type="password")

st.title(f"🤖 {BOT_NAME} AI")
st.write(f"Created by {OWNER_NAME}")

if not user_api_key:
    st.warning("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")
else:
    client = OpenAI(api_key=user_api_key)

    def get_wikipedia_info(query):
        try: return wikipedia.summary(query, sentences=2)
        except: return "Sorry sir, I couldn't find info about that."

    def ask_openai(prompt):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"You are {BOT_NAME}, created by {OWNER_NAME}."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {e}"

    def shul_brain(user_input):
        user_input_lower = user_input.lower()
        # Aapka saara "if/else" logic yahan paste karein...
        if "who is your sir" in user_input_lower:
            return "My sir is Adhyan Sarthak."
         if "who made you" in user_input_lower:
        return f"I was made by santosh singh son adhyan sarthak."
    
    if "how old is adhyan sarthak" in user_input_lower:
        return f"he was 12 year old in offical card but in real age of adhyan sarthak 13."
    
    if "which date adhyan sarthak birthday" in user_input_lower:
        return f"the birthday of adhyan sarthak is 14 march 2012 the special date of my sir adhyan sathak is mathematic day."
    
    if "kem chho" in user_input_lower:
        return f"majma sir."
    
    
    if "who is best friend of adhyan sarthak" in user_input_lower:
        return f"the best freind of adhyan sarthak is anand raj tomar."
    
    if "which colour is Favorite of adhyan sarthak" in user_input_lower:
        return f"the favorite colour of adhyan sarthak is red."
    
    if "which subject is Favorite of adhyan sarthak" in user_input_lower:
        return f"the favorite subject of adhyan sarthak is computer / math/ science."

    if "hi" in user_input_lower:
        return f"hello boss how are you, how can i help you."

    if "hello" in user_input_lower:
        return f"hello boss how are you, how can i help you."
  
    if "hye" in user_input_lower:
        return f"hello boss how are you, how can i help you."
    
    if "i am fine" in user_input_lower:
        return f"oh very nice how today is going with you."

    if "wich is best god for adhyan sathak" in user_input_lower:
        return f"the best god of adhyan sarthak is lord shiva."
 
    if "who is your sir" in user_input_lower:
        return f"my sir is adhyan sarthak."
    
    if "what is dream of adhyan sarthak" in user_input_lower:
        return f"the dream of adhyan sarthak is making a big space company who's name is amisro with his partner anand raj tomar."

    if "what is email adress of adhyan sarthak" in user_input_lower:
        return f"the email adress of adhyan sarthak is adhyansarthak@gmail.com and adhyansarthak@zohomail.in."
    
   
    if "who is father of adhyan sarthak" in user_input_lower:
        return f"the father of adhyan sarthak is santosh kumar singh."
    
    if "who is mother of adhyan sarthak" in user_input_lower:
        return f"the mother of adhyan sarthak is kunti devi."
    
    if "who is sister of adhyan sarthak" in user_input_lower:
        return f"the sister of adhyan sarthak is ananya anand and sweta singh rajput."

    if "who is adhyan sarthak" in user_input_lower:
        return f"adhyan sarthak is a good boy he read in class seven in doon public school he made many ai like inxon, pikachu, shul."

        elif "date" in user_input_lower or "time" in user_input_lower:
            return datetime.now().strftime('%A, %d %B %Y, %I:%M %p')
        else:
            return ask_openai(user_input)

    # Chat Interface
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ask Shul something..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        response = shul_brain(prompt)
        
        st.session_state.messages.append({"role": "assistant", "content": response})
        with st.chat_message("assistant"):
            st.markdown(response)
