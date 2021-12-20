import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyCjhoMXQ7UiHtoqBLs3f32TMBwC_U5dLjg",
    authDomain: "clone-57c79.firebaseapp.com",
    projectId: "clone-57c79",
    storageBucket: "clone-57c79.appspot.com",
    messagingSenderId: "554366312918",
    appId: "1:554366312918:web:54950d325f449ee0690477"
  };

  const app = !firebase.apps.length 
  ? firebase.initializeApp(firebaseConfig) 
  : firebase.app();

  const db = app.firestore();

  export default db;