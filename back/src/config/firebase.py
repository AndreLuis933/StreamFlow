from firebase_admin import credentials, firestore, initialize_app

cred = credentials.Certificate("secret_firebase.json")
initialize_app(cred)
db = firestore.client()
