import * as firebase from "firebase";
import firestore from "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyCfPc8cSlmZSz_FMZdkzprHkGmPj8CerZU",
  authDomain: "mareuapp.firebaseapp.com",
  databaseURL: "https://mareuapp.firebaseio.com",
  projectId: "mareuapp",
  storageBucket: "mareuapp.appspot.com",
  messagingSenderId: "128812534392",
  appId: "1:128812534392:web:e4faf1f2fc5edaa7207b8d",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.firestore();
export default firebase;
