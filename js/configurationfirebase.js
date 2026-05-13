var db, auth, storage, currentUID = null, smatID = null;

const firebaseConfig = {
    apiKey: "AIzaSyAMxtJedkehhxJRMPZLjhpKHqneHEWsGlE",
    authDomain: "smat-exchange.firebaseapp.com",
    databaseURL: "https://smat-exchange-default-rtdb.firebaseio.com",
    projectId: "smat-exchange",
    storageBucket: "smat-exchange.firebasestorage.app",
    messagingSenderId: "836334569396",
    appId: "1:836334569396:web:679effe640b3453412d4e1"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

db = firebase.database();
auth = firebase.auth();
storage = (typeof firebase.storage === "function") ? firebase.storage() : null;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUID = user.uid;
        smatID = user.uid;
        localStorage.setItem('smatID', user.uid);
    } else {
        currentUID = null;
        smatID = null;
    }
});