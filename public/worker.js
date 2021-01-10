console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  e.waitUntil(
	  self.registration.showNotification(data.title, {
	    body: "Click this notification to show your QR Code.",
	    icon: "venue-logo-png.png",
      data: data.redirect_url,
	    requireInteraction: true
	  })
  )
});


self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event);
  const redirect_url = event.notification.data
  event.notification.close();

  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(async function(clientList) {
  	// let venue_url = process.env.NODE_ENV === "production" ?
  	// "https://viengage.com/" :
  	// "http://localhost:8080/"
  	let push_client;
    for (let i = 0; i < clientList.length; i++) {
      let client = clientList[i];
    	console.log("client url", client['url'])
    	// Checks if a tab with venue is open open
    	if(client['url'].indexOf(redirect_url) >= 0){
      	client.focus();
      	push_client = client;
      	break;
    	}
      // client.navigate("http://localhost:8080/#/meeting_info/5f763f908b40c061198e36bc")
    }
    if(!push_client)
    	push_client = await clients.openWindow(redirect_url)
  }));
});