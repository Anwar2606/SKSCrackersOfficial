import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  //testing
  // apiKey: "AIzaSyCTmFMUSQL_lvxZSGzihrx5G7AypB4Uk5Q",
  // authDomain: "testing-855ce.firebaseapp.com",
  // projectId: "testing-855ce",
  // storageBucket: "testing-855ce.appspot.com",
  // messagingSenderId: "1086229411180",
  // appId: "1:1086229411180:web:4a835dadcfb73b08a42f49" 
  
    //main
    apiKey: "AIzaSyDpYg93SZ_op8WCqFaKuCPfM_Ivghwg2ng",
    authDomain: "main-billing-software-1.firebaseapp.com",
    projectId: "main-billing-software-1",
    storageBucket: "main-billing-software-1.appspot.com",
    messagingSenderId: "867291106189",
    appId: "1:867291106189:web:26592291d93bcfbdf58bc4"                                                                                                      
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const storage = getStorage(app); 
const auth = getAuth(app); 

export { db, storage, auth }; 
