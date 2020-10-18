import API from '@/services/API'
const publicVapidKey =
  "BG5zFCphvwcm3WYs3N5d41jO85PcvpJkEYPlz9j3OjVdzI_XX0KPw_U8V5aEmaOBHXIymaGcCWyOAH-TmoobXKA"

export default {
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
  async sendNotification() {
    // Check for service worker
    if ("serviceWorker" in navigator) {
      console.log("Service worker was found?")
    } else {
      console.log("Service worker NOT found?")
    }

    // Register Service Worker
    console.log("Registering service worker...");
    let register = await navigator.serviceWorker.register("worker.js", {
      scope: "/"
    });
    console.log("Service Worker Registered...", register);

    // if(reg.installing) {
    //      console.log('Service worker installing');
    //  } else if(reg.waiting) {
    //      console.log('Service worker installed');
    //  } else if(reg.active) {
    //      console.log('Service worker active');
    //  }
    console.log("Waiting for service worker to be ready...")
    register = await navigator.serviceWorker.ready
    console.log("Service worker ready", register) 

    // Register Push
    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
    });
    console.log("Push Registered...", subscription);

    // Send Push Notification
    console.log("Sending Push...");
    return API().post('notifications/send', {
      subscription: subscription
    }).then(() => {console.log("Push sent")})
  }
}
