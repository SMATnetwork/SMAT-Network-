(function() {
    "use strict";

    const securityConfig = {
        blockInspect: true,
        blockRightClick: true,
        blockCopy: true,
        blockDevTools: false, // স্ক্রিনশট স্মুথ রাখতে এটি false করা হয়েছে
        clearConsole: true
    };

    // ১. কিবোর্ড শর্টকাট ব্লকার (সংশোধিত)
    document.addEventListener("keydown", function(e) {
        // স্ক্রিনশট ও ব্যবহারের সুবিধার জন্য P (80) এবং S (83) বাদ দেওয়া হয়েছে
        // এখন শুধু U (View Source), F (Find), A (Select All), C (Copy), V (Paste) ব্লক থাকবে
        const forbiddenKeys = [85, 70, 65, 67, 86]; 
        
        if (e.ctrlKey && forbiddenKeys.includes(e.keyCode)) {
            e.preventDefault();
            return false;
        }

        // F12 এবং Ctrl+Shift+I (ইনস্পেক্ট) ব্লক থাকবে
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode))) {
            e.preventDefault();
            return false;
        }
    }, false);

    // ২. টেক্সট সিলেকশন এবং কপি সুরক্ষা
    if (securityConfig.blockCopy) {
        document.addEventListener("copy", (e) => e.preventDefault(), false);
        document.addEventListener("cut", (e) => e.preventDefault(), false);
        document.addEventListener("selectstart", (e) => e.preventDefault(), false);
    }

    // ৩. রাইট ক্লিক এবং ড্র্যাগ সুরক্ষা
    if (securityConfig.blockRightClick) {
        document.addEventListener("contextmenu", (e) => e.preventDefault(), false);
    }
    document.addEventListener("dragstart", (e) => e.preventDefault(), false);

    // ৪. Anti-Iframe
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }

    console.log("SmatBit Security System v2.1 - Screenshot Enabled");

})();