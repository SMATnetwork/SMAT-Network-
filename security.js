/* security.js */

// ১. রাইট-ক্লিক মেনু (Context Menu) বন্ধ
document.addEventListener('contextmenu', e => e.preventDefault());

// ২. কিবোর্ড শর্টকাট এবং ডেভেলপার টুলস ব্লক
document.onkeydown = function(e) {
    // F12 key (Developer Tools)
    if (e.keyCode == 123) {
        return false;
    }
    
    // Ctrl+Shift+I (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }

    // Ctrl+U (View Source Code)
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }

    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
        return false;
    }

    // Ctrl+C (Copy)
    if (e.ctrlKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
};

// ৩. অতিরিক্ত লেয়ার: ড্র্যাগ করে ইমেজ ড্রপ করা বন্ধ (বিকল্প ব্যবস্থা)
window.addEventListener('dragstart', function(e) {
    if (e.target.nodeName === 'IMG') {
        e.preventDefault();
    }
}, false);
