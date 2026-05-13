(function() {
    "use strict";

    const securityConfig = {
        blockInspect: true,
        blockRightClick: true,
        blockCopy: true,
        blockDevTools: true,
        clearConsole: true
    };

    // ১. কিবোর্ড শর্টকাট ব্লকার
    document.addEventListener("keydown", function(e) {
        // Block Ctrl + (U, S, P, F, A, C, V)
        const forbiddenKeys = [85, 83, 80, 70, 65, 67, 86]; 
        if (e.ctrlKey && forbiddenKeys.includes(e.keyCode)) {
            e.preventDefault();
            return false;
        }

        // Block Ctrl + Shift + (I, J, C)
        if (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) {
            e.preventDefault();
            return false;
        }

        // Block F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
    }, false);

    // ২. টেক্সট সিলেকশন এবং কপি সুরক্ষা (এটি আলাদা থাকতে হবে)
    if (securityConfig.blockCopy) {
        document.addEventListener("copy", (e) => e.preventDefault(), false);
        document.addEventListener("cut", (e) => e.preventDefault(), false);
        document.addEventListener("selectstart", (e) => e.preventDefault(), false);
    }

    // ৩. DevTools Detection (অপ্টিমাইজড)
    if (securityConfig.blockDevTools) {
        let isRedirecting = false;
        setInterval(() => {
            if (isRedirecting) return;
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;
            
            if (widthDiff || heightDiff) {
                isRedirecting = true;
                console.clear();
                console.log("%cSTOP! SmatBit Security Active.", "color: red; font-size: 20px;");
                setTimeout(() => { isRedirecting = false; }, 2000);
            }
        }, 1000);
    }

    // ৪. রাইট ক্লিক এবং ড্র্যাগ সুরক্ষা
    if (securityConfig.blockRightClick) {
        document.addEventListener("contextmenu", (e) => e.preventDefault(), false);
    }
    document.addEventListener("dragstart", (e) => e.preventDefault(), false);

    // ৫. Anti-Iframe
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }

    console.log("SmatBit Security System v2.0 - Active");

})();
