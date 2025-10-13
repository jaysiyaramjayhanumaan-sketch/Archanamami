let seats = JSON.parse(localStorage.getItem("seats")) || Array.from({length: 56}, (_, i) => ({
    seatNo: i+1, name: "", mobile: "", admissionDate: "", months: "", dueDate: "", fees: "", photo: ""
}));

let editIndex = null;

// Status function
function getStatus(dueDate){
    if(!dueDate) return {text: "", class: "", priority: 3};
    let today = new Date();
    let d = new Date(dueDate);
    let diffDays = Math.floor((d - today) / (1000*60*60*24));
    if(diffDays < 0){
        return {text: `Overdue ${Math.abs(diffDays)} days`, class: "overdue", priority: 1};
    } else if(diffDays <= 3){
        return {text: "Due Soon", class: "due-soon", priority: 2};
    }
    return {text: "", class: "", priority: 3};
}

// Render seats
function renderSeats(showEmptyOnly = false, filter = "all") {
    const grid = document.getElementById('seatGrid');
    grid.innerHTML = "";

    // Toggle grid classes
    if(showEmptyOnly){
        grid.classList.add('grid-view');
        grid.classList.remove('show-all');
    } else {
        grid.classList.remove('grid-view');
        grid.classList.add('show-all');
    }

    seats.sort((a,b)=>{
        let aStatus = getStatus(a.dueDate);
        let bStatus = getStatus(b.dueDate);
        if(aStatus.priority !== bStatus.priority){
            return aStatus.priority - bStatus.priority;
        }
        return a.seatNo - b.seatNo;
    });

    seats.forEach((seat,index)=>{
        let isEmpty = !seat.name || seat.name.trim() === "";
        if (filter === "empty" && !isEmpty) return;
        if (filter === "filled" && isEmpty) return;


        let statusInfo = getStatus(seat.dueDate);
        let card = document.createElement('div');
        card.className = 'card';
        if(!isEmpty) card.classList.add('occupied');

        if (filter === "empty" && isEmpty) {
    // Empty seat - theatre style
    card.style.width = '40px';
    card.style.height = '40px';
    card.style.display = 'flex';
    card.style.justifyContent = 'center';
    card.style.alignItems = 'center';
    card.style.fontSize = '12px';
    card.style.backgroundColor = '#fff';
    card.style.border = '1px solid #999';
    card.textContent = seat.seatNo;
} else
if (filter === "filled" && !isEmpty) {
    // Filled seat - theatre style
    card.style.width = '40px';
    card.style.height = '40px';
    card.style.display = 'flex';
    card.style.justifyContent = 'center';
    card.style.alignItems = 'center';
    card.style.fontSize = '12px';
    card.style.backgroundColor = '#dff0d8'; // light green
    card.style.border = '1px solid #666';
    card.textContent = seat.seatNo;
    card.classList.add('occupied');
} else {
            // Occupied seats → normal cards
            card.style.width = '';
            card.style.height = '';
            card.innerHTML = `
    <img src="${seat.photo || 'https://via.placeholder.com/200'}" alt="Photo">
    <div class="details">
        <strong>Seat:</strong> ${seat.seatNo}<br>
        <strong>Name:</strong> ${seat.name}<br>
        <strong>Mobile:</strong> ${seat.mobile}<br>
        <strong>Admission:</strong> ${seat.admissionDate}<br>
        <strong>Months:</strong> ${seat.months}<br>
        <strong>Due Date:</strong> ${seat.dueDate}<br>
        <strong>Fees:</strong> ${seat.fees}<br>
        <strong>Outstanding:</strong> ${seat.outstanding || 0}<br>
        <strong>Remark:</strong> <span style="color: ${seat.remark === 'Overdue' ? 'red' : 'orange'}">${seat.remark || ''}</span>
    </div>
    <div class="status ${statusInfo.class}">${statusInfo.text}</div>
    <div class="button-group">
        <button class="edit-btn" onclick="editSeat(${index})">✏️ Edit</button>
        ${(statusInfo.priority === 1 || statusInfo.priority === 2) && seat.mobile
          ? `<a class="call-btn" href="tel:${seat.mobile}">📞 Call</a>
<button class="sms-btn" onclick="openSMS('${seat.mobile}', '${seat.name}', '${seat.dueDate}')">📩 SMS</button>


 <button class="whatsapp-btn" onclick="openWhatsApp('${seat.mobile}', '${seat.name}', '${seat.dueDate}')">💬 WhatsApp</button>`
          : ""}
    </div>
`;

        }
        grid.appendChild(card);
    });
}


function editSeat(index){
    editIndex = index;
    let seat = seats[index];
    document.getElementById('editName').value = seat.name || "";
    document.getElementById('editMobile').value = seat.mobile || "";
    document.getElementById('editAdmissionDate').value = seat.admissionDate || "";
    document.getElementById('editMonths').value = seat.months || "";
    document.getElementById('editFees').value = seat.fees || "";
    document.getElementById('editOutstanding').value = seat.outstanding || "";
    document.getElementById('editRemark').value = seat.remark || "";

    document.getElementById('editDueDate').value = seat.dueDate || "";
    document.getElementById('photoPreview').src = seat.photo || "";
document.getElementById('editPhoto').onchange = function(e){
    let file = e.target.files[0];
    if(file){
        let reader = new FileReader();
        reader.onload = function(evt){
            document.getElementById('photoPreview').src = evt.target.result;
        }
        reader.readAsDataURL(file);
    }
}

    document.getElementById('editModal').style.display = 'flex';

    document.getElementById('editMonths').oninput = updateDueDate;
document.getElementById('editAdmissionDate').oninput = updateDueDate;

document.getElementById('editDueDate').addEventListener('input', function() {
    let dueDateStr = this.value;
    if (!dueDateStr) {
        document.getElementById('editRemark').value = "";
        return;
    }

    let dueDate = new Date(dueDateStr);
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
        document.getElementById('editRemark').value = "overdue";
    } else {
        document.getElementById('editRemark').value = "";
    }
});






// Call & WhatsApp update
document.getElementById("callBtn").href = "tel:" + (seat.mobile || "");
document.getElementById("whatsappBtn").href = "https://wa.me/" + (seat.mobile || "");

document.getElementById('editPhoto').onchange = function(e){
        let file = e.target.files[0];
        if(file){
            let reader = new FileReader();
            reader.onload = function(evt){
                document.getElementById('photoPreview').src = evt.target.result;
            }
            reader.readAsDataURL(file);
        }
    }
}









// Update due date
function updateDueDate(){
    let admission = document.getElementById('editAdmissionDate').value;
    let months = parseInt(document.getElementById('editMonths').value);

    if(admission && !isNaN(months)){
        let ad = new Date(admission);
        ad.setMonth(ad.getMonth() + months);
        
        let dueDateStr = ad.toISOString().split('T')[0];
        document.getElementById('editDueDate').value = dueDateStr;

        // Overdue check
        let today = new Date();
        today.setHours(0, 0, 0, 0); // remove time part

        if(ad < today){
            document.getElementById('editRemark').value = "overdue";
        } else {
            document.getElementById('editRemark').value = "";
        }
    }
}
function updateOverdueRemarks() {
    let today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time part

    for (let i = 0; i < seats.length; i++) {
        let seat = seats[i];
        if (seat.dueDate) {
            let due = new Date(seat.dueDate);
            due.setHours(0, 0, 0, 0);
            if (due < today) {
                seat.remark = "Overdue";
            } else {
                seat.remark = ""; // Optional: clear remark if not overdue
            }
        }
    }
}



function saveSeat(){
    const seat = seats[editIndex];

    if (!seat) {
        alert("Seat not found.");
        return;
    }

    seat.name = document.getElementById('editName').value;
    seat.mobile = document.getElementById('editMobile').value;
    seat.admissionDate = document.getElementById('editAdmissionDate').value;
    seat.months = document.getElementById('editMonths').value;
    seat.fees = document.getElementById('editFees').value;
    seat.dueDate = document.getElementById('editDueDate').value;
updateDueDate();  // calculate dueDate just before saving
seat.dueDate = document.getElementById('editDueDate').value;

    seat.outstanding = document.getElementById('editOutstanding').value;
    seat.remark = document.getElementById('editRemark').value.trim();
    seat.photo = document.getElementById('photoPreview').src;

    // ✅ Debug line
    console.log("Photo saved for seat " + seat.seatNo, seat.photo);

    localStorage.setItem("seats", JSON.stringify(seats));

    closeModal();
    renderSeats();

    // Optional: refresh search result
    document.getElementById('searchBtn').click();
}

function downloadBlob(blob, filename) {
    var reader = new FileReader();
    reader.onload = function() {
        var base64 = reader.result;
        AndroidBridge.saveBase64File(base64, filename);
    };
    reader.readAsDataURL(blob);
}


// Delete seat
function deleteSeat(){
    if(confirm("Are you sure you want to delete this seat's data?")){
        seats[editIndex] = { seatNo: seats[editIndex].seatNo, name: "", mobile: "", admissionDate: "", months: "", dueDate: "", fees: "", photo: "" };
        localStorage.setItem("seats", JSON.stringify(seats));
        closeModal();
        renderSeats();
    }
}

// Close modal
function closeModal(){
    document.getElementById('editModal').style.display = 'none';
}
function showNotifications() {
    let today = new Date().toISOString().split('T')[0];
    let dueSoonList = [];
    let overdueList = [];

    seats.forEach(s => {
        if (s.dueDate) {
            let diff = Math.floor((new Date(s.dueDate) - new Date(today)) / (1000*60*60*24));
            
            if (diff < 0) {
                overdueList.push({ name: s.name || "Unknown", seat: s.seatNo, days: Math.abs(diff) });

                // ✅ Auto-fill remark
                s.remark = "Overdue";

            } else if (diff <= 3) {
                dueSoonList.push({ name: s.name || "Unknown", seat: s.seatNo, days: diff });

                // ✅ Auto-fill remark
                s.remark = `Due in ${diff} day${diff === 1 ? '' : 's'}`;
            } else {
                // ✅ Clear remark if not due/overdue
                s.remark = "";
            }
        } else {
            s.remark = "";
        }
    });

    // ✅ Optional: Save updated data to localStorage
    localStorage.setItem('seats', JSON.stringify(seats));

    // 🖼️ Show popup
    if (dueSoonList.length > 0 || overdueList.length > 0) {
        let html = `<h2>📢 Fee Alerts</h2>`;

        if (overdueList.length > 0) {
            html += `<h3 style="color:white;background:#ff4d4d;padding:5px;border-radius:5px;">Overdue</h3><ul>`;
            overdueList.forEach(s => {
                html += `<li><strong>${s.name}</strong> (Seat ${s.seat}) - Overdue ${s.days} days</li>`;
            });
            html += `</ul>`;
        }

        if (dueSoonList.length > 0) {
            html += `<h3 style="color:black;background:#ffcc00;padding:5px;border-radius:5px;">Due Soon</h3><ul>`;
            dueSoonList.forEach(s => {
                html += `<li><strong>${s.name}</strong> (Seat ${s.seat}) - Due in ${s.days} days</li>`;
            });
            html += `</ul>`;
        }

        html += `<button onclick='this.parentElement.parentElement.remove()'>Close</button>`;

        let modal = document.createElement('div');
        modal.className = 'modal notify-modal';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.innerHTML = `<div class='modal-content'>${html}</div>`;
        document.body.appendChild(modal);
    }
}
function openSMS(number, name, dueDateStr) {
    if (!/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)) {
        alert("SMS feature is only available on mobile devices.");
        return;
    }

    let cleanNumber = number.replace(/\D/g, "");
    if (!cleanNumber.startsWith("91")) cleanNumber = "91" + cleanNumber;

    const dueDate = new Date(dueDateStr);
    const today = new Date();
    const timeDiff = today - dueDate;
    const dueDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const formattedDueDate = `${String(dueDate.getDate()).padStart(2, '0')}-${dueDate.toLocaleString('en-US', { month: 'short' })}-${dueDate.getFullYear()}`;

    let message;
   if (dueDays > 5) {
    message = `Dear ${name}, we hope you are doing well. This is a gentle reminder that your library fee has been overdue since ${formattedDueDate} (${dueDays} days ago). We kindly request you to call us at your convenience and let us know your plan for the payment. - Wisdom Library.`;
} else {
    message = `Hello ${name}, your library fee was due on ${formattedDueDate} (${dueDays} day${dueDays !== 1 ? 's' : ''} ago). Please settle it at the earliest to keep enjoying library services. Sent by Wisdom Library.`;
}


    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS
        ? `sms:${cleanNumber}&body=${encodeURIComponent(message)}`
        : `sms:${cleanNumber}?body=${encodeURIComponent(message)}`;

    window.location.href = smsUrl;
}







// WhatsApp function
function openWhatsApp(number, name, dueDateStr) {
    let cleanNumber = number.replace(/\D/g, "");
    if (!cleanNumber.startsWith("91")) cleanNumber = "91" + cleanNumber;

    const dueDate = new Date(dueDateStr);

    if (isNaN(dueDate)) {
        alert("Invalid due date provided.");
        return;
    }

    const today = new Date();
    const timeDiff = today - dueDate;
    const dueDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const formattedDueDate = `${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}-${dueDate.getFullYear()}`;

    // Conditional message
    let message;
    if (dueDays > 5) {
        message = `Dear ${name}, we hope you are doing well. This is a gentle reminder that your library fee has been overdue since ${formattedDueDate} (${dueDays} days ago). We kindly request you to call us at your convenience and let us know your plan for the payment. - Wisdom Library.`;
    } else {
        message = `Hello ${name}, your library fee was due on ${formattedDueDate} (${dueDays} day${dueDays !== 1 ? 's' : ''} ago). Please settle it at the earliest to keep enjoying library services. Sent by Wisdom Library.`;
    }

    // ✅ Open WhatsApp in new tab (more reliable)
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
}




// Show empty / all buttons
document.getElementById('showEmptyBtn').addEventListener('click',function(){
    renderSeats(false, "empty");
    this.style.display = 'none';
    document.getElementById('showAllBtn').style.display = 'inline-block';
});

document.getElementById('showAllBtn').addEventListener('click',function(){
    renderSeats(false, "all");
    this.style.display = 'none';
    document.getElementById('showEmptyBtn').style.display = 'inline-block';
});
document.getElementById('showFilledBtn').addEventListener('click', function () {
    renderSeats(false, "filled");


    document.getElementById('showAllBtn').style.display = 'inline-block';

});

async function backupData() {
  const backupSeats = seats.slice(0, 56);
  const dataStr = JSON.stringify(backupSeats);
  
  // ✅ 1. Android WebView (if inside app)
  if (typeof AndroidBridge !== "undefined" && AndroidBridge.backup) {
    AndroidBridge.backup(dataStr);
    return;
  }

  // ✅ 2. Modern Desktop Browser (show Save As dialog)
  if ('showSaveFilePicker' in window) {
    const options = {
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] },
      }],
      suggestedName: 'seat-backup.json'
    };

    try {
      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(dataStr);
      await writable.close();
      return;
    } catch (err) {
      console.error('File save cancelled or failed', err);
      // fallback to download method below
    }
  }

  // ✅ 3. Mobile browsers & older fallback (download .json file)
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'seat-backup.json';

  // Some mobile browsers (like Chrome on Android) auto-download to Downloads folder
  // No full dialog, but user gets the file saved

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Cleanup URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}





// ✅ Restore Function
function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      let importedData = JSON.parse(e.target.result);

      // सिर्फ 56 सीटों तक ही
      if (Array.isArray(importedData)) {
        importedData = importedData.slice(0, 56);
      } else {
        alert("Invalid backup format.");
        return;
      }

      seats = importedData;
      localStorage.setItem("seats", JSON.stringify(seats));
      renderSeats();
      alert("Data restored successfully!");
    } catch (err) {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}


// ✅ Attach button listeners
document.querySelector('.backup-btn').addEventListener('click', backupData);

// ✅ Hidden input for restore
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/json';
fileInput.style.display = 'none';
fileInput.addEventListener('change', restoreData);
document.body.appendChild(fileInput);

// ✅ Trigger file input when restore button clicked
// ✅ Trigger file input when restore button clicked
document.querySelector('.restore-btn').addEventListener('click', () => {
  // Check if AndroidBridge is available (i.e. running inside app)
  if (typeof AndroidBridge !== "undefined" && AndroidBridge.requestRestore) {
    AndroidBridge.requestRestore(); // Native side will send JSON via JS
  } else {
    fileInput.click(); // Fallback for browser
  }
});

// Change input type & placeholder based on search type selected
document.getElementById('searchType').addEventListener('change', function() {
  const input = document.getElementById('searchInput');
  if (this.value === 'seatNo') {
    input.type = 'number';
    input.placeholder = "Enter seat number";
    input.value = "";
  } else {
    input.type = 'text';
    input.placeholder = "Enter name";
    input.value = "";
  }
});



// Search
document.getElementById('searchType').addEventListener('change', function() {
    const input = document.getElementById('searchInput');
    if (this.value === 'seatNo') {
        input.type = "number";
        input.placeholder = "Enter seat number";
        input.value = "";
    } else {
        input.type = "text";
        input.placeholder = "Enter name";
        input.value = "";
    }
});

document.getElementById('searchBtn').addEventListener('click', () => {
    const type = document.getElementById('searchType').value;
    const queryRaw = document.getElementById('searchInput').value.trim();
    const query = queryRaw.toLowerCase();
    const resultDiv = document.getElementById('searchResult');
    resultDiv.innerHTML = "";

    if (!queryRaw) {
        resultDiv.innerHTML = "<p>Please enter a search term.</p>";
        return;
    }

    let foundSeat = null;
    if (type === "name") {
        foundSeat = seats.find(seat => seat.name.toLowerCase() === query);
    } else if (type === "seatNo") {
        const seatNumber = parseInt(queryRaw, 10);
        if (isNaN(seatNumber)) {
            resultDiv.innerHTML = "<p>Please enter a valid seat number.</p>";
            return;
        }
        foundSeat = seats.find(seat => Number(seat.seatNo) === seatNumber);
    }

    if (foundSeat) {
        const statusInfo = getStatus(foundSeat.dueDate);
        resultDiv.innerHTML = `
        <div class="card" style="max-width: 300px;">
            <img src="${foundSeat.photo || 'https://via.placeholder.com/200'}" alt="Photo" style="width:100%; height:auto;">
            <div class="details">
                <strong>Seat:</strong> ${foundSeat.seatNo}<br>
                <strong>Name:</strong> ${foundSeat.name}<br>
                <strong>Mobile:</strong> ${foundSeat.mobile}<br>
                <strong>Admission:</strong> ${foundSeat.admissionDate}<br>
                <strong>Months:</strong> ${foundSeat.months}<br>
                <strong>Due Date:</strong> ${foundSeat.dueDate}<br>
                <strong>Fees:</strong> ${foundSeat.fees}<br>
<strong>Outstanding:</strong> ${foundSeat.outstanding || '0'}<br>
            <strong>Remark:</strong> ${foundSeat.remark || '-'}<br>
                <div class="status ${statusInfo.class}" style="margin-top: 8px;">${statusInfo.text}</div>
            </div>
 <div class="button-group" style="margin-top:10px;">
  <button onclick="editSeat(${seats.findIndex(s => s.seatNo === foundSeat.seatNo)})" style="padding:6px 12px; background:#0066CC; color:white; border:none; border-radius:5px; cursor:pointer;">
    ✏️ Edit
  </button>
</div>



        </div>`;




        document.getElementById('clearSearchBtn').style.display = "inline-block";
    } else {
        resultDiv.innerHTML = "<p>No matching seat found.</p>";
    }
});

document.getElementById('clearSearchBtn').addEventListener('click', function() {
    document.getElementById('searchResult').innerHTML = "";
    document.getElementById('searchInput').value = "";
    this.style.display = "none";
    renderSeats();
});

window.onload = () => {
    renderSeats();
    showNotifications();   // ✅ Fee Alerts bhi page load par show honge
};
function showNotifications() {
  alertsList.innerHTML = ""; // पहले साफ करो

  let today = new Date().toISOString().split('T')[0];

  seats.forEach(s => {
    if (s.dueDate) {
      let diff = Math.floor((new Date(s.dueDate) - new Date(today)) / (1000*60*60*24));
      if (diff < 0) {
        // Overdue alert
        addAlert(`Seat No ${s.seatNo} ( ${s.name} ) Overdue ${Math.abs(diff)} days`);
      } else if (diff <= 3) {
        // Due soon alert
        addAlert(`Seat No ${s.seatNo} ( ${s.name} ) Due in ${diff} days`);
      }
    }
  });
}


// ✅ Remove Photo button functionality
let removePhotoBtn = document.getElementById("removePhotoBtn");
if(removePhotoBtn){
    removePhotoBtn.addEventListener("click", () => {
        document.getElementById("photoPreview").src = "";
        if(editIndex !== null){
            seats[editIndex].photo = "";   // remove from data also
            localStorage.setItem("seats", JSON.stringify(seats));
        }
    });
}
// ✅ Call & WhatsApp buttons ko dynamic banane ke liye
function updateContactLinks() {
    let mobileInput = document.getElementById("editMobile");
    let callBtn = document.getElementById("callBtn");
    let whatsappBtn = document.getElementById("whatsappBtn");

    if (mobileInput && callBtn && whatsappBtn) {
        let number = mobileInput.value.trim();

        // Agar 10 digit number hai to '91' prefix add karo
        if (number.length === 10) {
            number = "91" + number;
        }

        callBtn.href = "tel:" + number;
        whatsappBtn.href = "https://wa.me/" + number;
    }
}

// 🔄 Jab modal khulta hai ya number edit hota hai
document.addEventListener("DOMContentLoaded", function () {
    let mobileInput = document.getElementById("editMobile");
    if (mobileInput) {
        mobileInput.addEventListener("input", updateContactLinks);
    }
});

// ✅ WhatsApp click handler without changing existing code
document.addEventListener("DOMContentLoaded", function () {
    function handleWhatsAppClick(e) {
        e.preventDefault();

        // Close modal if open
        if (typeof closeModal === "function") closeModal();

        // Show seat grid
        const seatGrid = document.getElementById('seatGrid');
        if (seatGrid) seatGrid.style.display = 'grid';

        // Clear search result
        const searchResult = document.getElementById('searchResult');
        if (searchResult) searchResult.innerHTML = "";

        // Open WhatsApp link in new tab (or native app in WebView)
        const href = e.currentTarget.getAttribute("href");
        if (href) window.location.href = href;
    }



    // Attach handler to all existing and future WhatsApp buttons
    function attachWhatsAppHandlers() {
        const whatsappButtons = document.querySelectorAll(".whatsapp-btn");
        whatsappButtons.forEach(btn => {
            btn.removeEventListener("click", handleWhatsAppClick);
            btn.addEventListener("click", handleWhatsAppClick);
        });
    }

    // Initial attachment
    attachWhatsAppHandlers();

    // Observe DOM changes to attach to future buttons dynamically
    const observer = new MutationObserver(attachWhatsAppHandlers);
    observer.observe(document.body, { childList: true, subtree: true });
});
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ✅ Use seats from localStorage / current array
   const rows = seats
    .filter(s => s.name && s.name.trim() !== "")  // sirf filled seats
    .map(s => [
        s.seatNo,
        s.name,
        s.mobile,
        s.admissionDate,
        s.dueDate,
        s.fees,
        s.months  // ✅ Correct field
    ]);


// Report Title
doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(40, 40, 40);
doc.text("Wisdom Library Seat Report", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

 // Table Generation
doc.autoTable({
    startY: 25,
   head: [["Seat No", "Name", "Mobile", "Admission Date", "Due Date", "Fees", "Months"]],

body: rows, // Make sure `rows` is a 2D array of string or number values
    theme: 'grid',

    styles: {
        fontSize: 11,
        font: "helvetica",
        halign: 'center',
        textColor: 20,
    },

    headStyles: {
        fillColor: [0, 102, 204],  // Blue background
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: 'center',
    },

    bodyStyles: {
        fontStyle: "normal",
    },

    alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternate rows
    },

    didDrawPage: function (data) {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = pageSize.width || doc.internal.pageSize.getWidth();
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = data.pageNumber;

        // Page number at bottom center
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100);
        doc.text(`Page ${pageCurrent} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: "center" });
    }
});

// === Summary Section (Last Page Only) ===

const totalSeats = rows.length;
const totalFees = rows.reduce((sum, r) => {
    let fee = Number(r[5]);
    return sum + (isNaN(fee) ? 0 : fee);
}, 0);

// Move to last page (in case there are multiple pages)
const totalPages = doc.internal.getNumberOfPages();
doc.setPage(totalPages);

// Draw Summary Box
const pageSize = doc.internal.pageSize;
const pageWidth = pageSize.width || doc.internal.pageSize.getWidth();
const pageHeight = pageSize.height || doc.internal.pageSize.getHeight();

const boxX = 14;
const boxY = pageHeight - 25;
const boxWidth = pageWidth - 28;
const boxHeight = 14;

// Green background box
doc.setFillColor(0, 153, 51);  // Green
doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

// Summary Text
doc.setTextColor(255, 255, 255); // White
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text(
    `Total Seats Filled: ${totalSeats} | Total Fees Collected: ${totalFees}`,
    pageWidth / 2,
    boxY + 9,
    { align: "center" }
);


// Download PDF
    // Blob बनाओ
var blob = doc.output("blob");
// ✅ अब AndroidBridge से save करवाओ
downloadBlob(blob, "wisdom-library-seat-report.pdf");

}
function downloadBlob(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}
// Restore backup from Android (called via AndroidBridge)
function restoreDataFromAndroid(jsonStr) {
  try {
    if (!jsonStr || typeof jsonStr !== "string") {
      alert("No data provided from Android.");
      return;
    }

    let importedData = JSON.parse(jsonStr);
    if (!Array.isArray(importedData)) {
      alert("Invalid backup format from Android.");
      return;
    }

    importedData = importedData.map((s, i) => ({
      seatNo: s.seatNo ?? (i + 1),
      name: s.name ?? "",
      mobile: s.mobile ?? "",
      admissionDate: s.admissionDate ?? "",
      months: s.months ?? "",
      dueDate: s.dueDate ?? "",
      fees: s.fees ?? "",
      photo: s.photo ?? ""
    }));

    seats = importedData;
    localStorage.setItem("seats", JSON.stringify(seats));
    renderSeats();
    alert("Data restored successfully from Android!");
  } catch (e) {
    alert("Failed to restore data from Android: " + e.message);
    console.error("Restore Error:", e);
  }
}
// 🔽 अपने JS file के सबसे अंत में यह जोड़ें
document.addEventListener("DOMContentLoaded", function () {
  const text = "Wisdom Library";
  const subText = "The Self Study Point"; // नया टेक्स्ट

  const splashText = document.getElementById("splashText");
  const splashSubText = document.getElementById("splashSubText");
  const splashSound = document.getElementById("splashSound");
  const splashScreen = document.getElementById("splashScreen");
  const mainApp = document.getElementById("mainApp");

  // ---- पहले मुख्य टेक्स्ट के लिए spans ----
  text.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.color = getRandomColor();
    splashText.appendChild(span);
  });

  // ---- अब subText के लिए spans ----
  subText.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.color = getRandomColor();
    splashSubText.appendChild(span);
  });

  // Animate letters one-by-one (पहले मुख्य टेक्स्ट फिर subText)
  const spansMain = splashText.querySelectorAll("span");
  const spansSub = splashSubText.querySelectorAll("span");

  // मुख्य टेक्स्ट animate
  spansMain.forEach((span, i) => {
    setTimeout(() => {
      span.classList.add("visible");
      splashSound.currentTime = 0;
      splashSound.play();
    }, i * 200); // delay between letters
  });

  // subText animate (मुख्य टेक्स्ट के बाद)
  spansSub.forEach((span, i) => {
    setTimeout(() => {
      span.classList.add("visible");
      splashSound.currentTime = 0;
      splashSound.play();
    }, (spansMain.length * 200) + (i * 200));
  });

  // After animation ends, hide splash and show main content
  setTimeout(() => {
    splashScreen.style.display = "none";
    mainApp.style.display = "block";
  }, (spansMain.length + spansSub.length) * 200 + 2000); // wait for both animations
});

// Function to get random color
function getRandomColor() {
  const colors = ["#FF5733", "#33FF57", "#33C1FF", "#FF33E3", "#FFD733", "#8D33FF"];
  return colors[Math.floor(Math.random() * colors.length)];
}

const alertsList = document.getElementById('alertsList');
const scrollBtn = document.getElementById('scrollBtn');

if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    alertsList.scrollTop = alertsList.scrollHeight; // नीचे स्क्रॉल
  });
}


// नया alert जोड़ने का function
// 🔄 नया alert जोड़ने का function
function addAlert(message, type = "normal") {
  const alertDiv = document.createElement('div');

  // type के हिसाब से class जोड़ो
  if (type === "overdue") {
    alertDiv.className = 'alert-item overdue-alert';
    alertDiv.innerHTML = `🚨 <strong style="margin-right:5px;">Overdue:</strong> ${message}`;
  } else if (type === "dueSoon") {
    alertDiv.className = 'alert-item due-alert';
    alertDiv.innerHTML = `⏳ <strong style="margin-right:5px;">Due Soon:</strong> ${message}`;
  } else {
    alertDiv.className = 'alert-item normal-alert';
    alertDiv.innerHTML = `🔔 ${message}`;
  }

  // close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.title = "Close";
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => alertsList.removeChild(alertDiv));
  alertDiv.appendChild(closeBtn);

  alertsList.appendChild(alertDiv);
}

// 🔽 Alerts Card Hide / Show logic
const alertsCard = document.getElementById('alertsCard'); // यह लाइन ज़रूरी है
const closeBoxBtn = document.getElementById('closeBoxBtn');

if (closeBoxBtn) {
  closeBoxBtn.addEventListener('click', () => {
    alertsCard.style.display = 'none'; // पूरा box hide कर दो
  });
}

// अगर closeAllBtn पहले से डिफाइन है तो उसी में box भी hide कर दें
if (closeAllBtn) {
  closeAllBtn.addEventListener('click', () => {
    alertsList.innerHTML = ''; // alerts साफ करो
    alertsCard.style.display = 'none'; // और पूरा box भी बंद कर दो
  });
}



// Example: आप अपने due-date alerts यहां से add कर सकते हैं
// addAlert('Seat 12: Due Date is coming soon');
// ... नीचे alerts वाला code है ...
// Example: आप अपने due-date alerts यहां से add कर सकते हैं
// addAlert('Seat 12: Due Date is coming soon');

// 🔽 यहां इस function को add करो:
function showNotifications() {
  alertsList.innerHTML = ""; 

  let today = new Date().toISOString().split('T')[0];
  let found = false;

  seats.forEach(s => {
    if (s.dueDate) {
      let diff = Math.floor((new Date(s.dueDate) - new Date(today)) / (1000*60*60*24));
      if (diff < 0) {
        addAlert(`Seat No ${s.seatNo} (${s.name}) Overdue ${Math.abs(diff)} days`, "overdue");
        found = true;
      } else if (diff <= 3) {
        addAlert(`Seat No ${s.seatNo} (${s.name}) Due in ${diff} days`, "dueSoon");
        found = true;
      }
    }
  });

  if (found) {
    alertsCard.style.display = 'block';
  } else {
    addAlert("कोई Fee Alert नहीं है");
    alertsCard.style.display = 'block';
  }
}
// JS के अंत में  
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en', { month: 'long' });
  const year = String(d.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
}
let currentEditSeatNo = null;

function openEditModal(seatNo) {
  const seat = seats.find(s => s.seatNo == seatNo);
  if (!seat) return;

  currentEditSeatNo = seat.seatNo;

  document.getElementById("editName").value = seat.name || "";
  document.getElementById("editMobile").value = seat.mobile || "";
  document.getElementById("editAdmissionDate").value = seat.admissionDate || "";
  document.getElementById("editMonths").value = seat.months || "";
  document.getElementById("editDueDate").value = seat.dueDate || "";
  document.getElementById("editFees").value = seat.fees || "";
  document.getElementById("editOutstanding").value = seat.outstanding || "";
  document.getElementById("editRemark").value = seat.remark || "";
  document.getElementById("photoPreview").src = seat.photo || "";

  document.getElementById("callBtn").href = "tel:" + (seat.mobile || "");

  // Call updateDueDate here to set due date & remarks correctly
  updateDueDate();

  document.getElementById("editModal").style.display = "block";
}




