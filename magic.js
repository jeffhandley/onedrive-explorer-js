function loadCameraRoll(url, done) {
    url = url || "https://graph.microsoft.com/v1.0/me/drive/special/cameraRoll/children";
    $.ajax({
        url: url,
        dataType: "json",
        headers: { "Authorization": "Bearer " + window.token },
        accept: "application/json",
        success: function(data) {
            console.log(data);
            window.photos = (window.photos || []).concat(data.value);
            console.log("PHOTOS", window.photos.length);

            if (data["@odata.nextLink"] && window.photos.length < 200) {
                loadCameraRoll(data["@odata.nextLink"])
            } else if (done) {
                done();
            }
        }
    });
}

function parsePhotoDateToFolder(photo) {
    var date = new Date(photo.createdDateTime);
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    return "/SkyDrive camera roll - " + date.getFullYear() + "/" + (date.getMonth() + 1) + " - " + monthNames[date.getMonth()];
}

function moveToYear(photo, done) {
    var folder = parsePhotoDateToFolder(photo);
    console.log(folder);

    $.ajax({
        method: "PATCH",
        url: "https://graph.microsoft.com/v1.0/me/drive/items/" + photo.id,
        headers: { "Authorization": "Bearer " + window.token, "Content-Type": "application/json" },
        dataType: "json",
        data: JSON.stringify({ parentReference: { path: "/drive/root:" + folder } }),
        success: function(data) { console.log(data); if (done) { done(); } }
    });
}

function moveNext(count) {
    count = count || 1;

    if (count == -1) {
        count = photos.length;
    }

    var until = photos.length - count;

    function done() {
        console.log("REMAINING", photos.length, count - 1);

        if (photos.length > until) {
            moveNext(photos.length - until);
        }
    }

    console.log("MOVING");

    var photo = photos.shift();

    if (photo && photo.image) {
        moveToYear(photo, function() {
            done();
        });
    } else {
        done();
    }
}

function moveAll() {
    for (var concurrent = 0; concurrent < 200; concurrent++) {
        moveNext(-1);
    }
}

function loadAndMoveNext() {
    loadCameraRoll(null, moveAll);
}
