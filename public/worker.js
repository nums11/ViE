console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  e.waitUntil(
	  self.registration.showNotification(data.title, {
	    body: "Click this notification to show your QR Code.",
	    icon: "venue-logo-png.png",
	    requireInteraction: true
	  })
  )
});


self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(async function(clientList) {
  	let venue_url = "http://localhost:8080"
  	let push_client;
    for (let i = 0; i < clientList.length; i++) {
      let client = clientList[i];
    	console.log("client url", client['url'])
    	// Checks if a tab with venue is open open
    	if(client['url'].indexOf(venue_url) >= 0){
    		console.log("Client was on venue url")
      	client.focus();
      	push_client = client;
      	break;
    	}
    	else{
    		console.log("Client was NOT on venue url")
    	}
      // client.navigate("http://localhost:8080/#/meeting_info/5f763f908b40c061198e36bc")
    }
    if(!push_client)
    	push_client = await clients.openWindow(venue_url)
  }));
});