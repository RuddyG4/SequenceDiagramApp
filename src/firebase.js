// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-YgwPExlksAk_kfL7tyrx2dGD_YRWt68",
  authDomain: "diagram-app-fc3f1.firebaseapp.com",
  databaseURL: "https://diagram-app-fc3f1-default-rtdb.firebaseio.com",
  projectId: "diagram-app-fc3f1",
  storageBucket: "diagram-app-fc3f1.appspot.com",
  messagingSenderId: "677104767165",
  appId: "1:677104767165:web:902dfeb6bc2a53cd22a7d4"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

export { firebaseApp, database }