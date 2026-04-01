//FOR CALENDER

function generatecalender(){
    let calendar=document.getElementById("calendar");//WE STORED DIV IN CALENDAR

    calendar.innerHTML = "";//CLEAR OLD

    let today=new Date();

    let month=today.getMonth();

    const year=today.getFullYear();

    let months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    let heading=document.getElementById("month");

    heading.innerText=months[month]+" "+year;


    //(year, month, day) “Go to next month, step back 1 day, and tell me the date”
    //ALSO MONTH STARTS FROM 0
    const daysInMonth=new Date(year, month+1, 0).getDate(); 

    for(let i=1;i<=daysInMonth;i++){
        let daybox=document.createElement("div");

        //This adds a CSS class called "day" to the element dayBox. Give this element a label called day so we can style or identify it
        daybox.classList.add("days");


        //HTML allows you to store extra data using data-*
        //Here: data-day = storing the day number
        daybox.setAttribute("data-day",i); //<div class="day" data-day="5"></div>

        daybox.innerText=i;

        calendar.appendChild(daybox);
    }

}

//ALWAYS LOAD CALENDER

document.addEventListener("DOMContentLoaded", function(){
    generatecalender();
});//THIS LINE MEANS WHEN HTML IS LOADED AND DOM IS READY, RUN THE FUNCTION

let add_task = document.getElementById("add_task");
let save_task = document.getElementById("save_task");
let task_list = document.getElementById("task_list");


//AFTER USER CLICKS ADD BUTTON
save_task.addEventListener("click", async function (e) {

    e.preventDefault(); // ✅ stop page reload (VERY IMPORTANT)

    let task = add_task.value.trim();

    if (task === "") {
        alert("ADD TASK");
        return;
    }

    try {
        let response = await fetch("/add_task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ add_task: task })
        });

        if (!response.ok) {
            alert("TASK NOT ADDED");
            return;
        }

        // IN IT THE RESPONSE SERVER SENDS TO FRONTEND res.status(201).json(new_task); IS STORED
        let data = await response.json(); 

        createTaskElement(data); // ✅ reusable function

        add_task.value = "";

    } catch (err) {
        alert("SERVER ERROR");
    }
});


// ✅ FUNCTION TO CREATE TASK (IMPORTANT)
function createTaskElement(data) {

    let li = document.createElement("li");

    let span = document.createElement("span");
    span.innerText = data.add_task;

    li.appendChild(span);
    li.setAttribute("data-id", data._id);

    // ===== DELETE =====
    let del_btn = document.createElement("button");
    del_btn.innerText = "❌";

    del_btn.addEventListener("click", async function () {

        let id = li.getAttribute("data-id");

        console.log("Deleting ID:", id); // ✅ debug

        let response = await fetch(`/delete_task/${id}`, {
            method: "DELETE"
        });

        let result = await response.json();

        if (response.ok && result.success) {
            li.remove(); // ✅ remove from UI
        } else {
            alert("FAILED TO DELETE TASK");
        }
    });

    li.appendChild(del_btn);

    // ===== UPDATE =====
    let update_btn = document.createElement("button");
    update_btn.innerText = "✏️";

    update_btn.addEventListener("click", async function () {

        let id = li.getAttribute("data-id");

        let newValue = prompt("Update task:", span.innerText);

        if (!newValue || newValue.trim() === "") return;

        let response = await fetch(`/update_task/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ add_task: newValue })
        });

        let result = await response.json();

        if (response.ok && result.success) {
            span.innerText = newValue; // ✅ update UI
        } else {
            alert("FAILED TO UPDATE TASK");
        }
    });

    li.appendChild(update_btn);

    task_list.appendChild(li);

    //ADD A NEW BUTTON PERFORM TASK IN FROM OF TASK
    let do_task=document.createElement("button");
    do_task.innerText="☑️";
    do_task.addEventListener("click", function(){
        //CREATE OPTION BOX
        let option_box=document.createElement("div"); 

        //OPTION 1 : MANUAL CHECK
        let manualbtn=document.createElement("button");
        manualbtn.innerText="MANUAL CHECKMARK ✔️";

        //MANUAL CHECK FUNCTIONALITY
        manualbtn.addEventListener("click",  function(){
            let todaydate=new Date().getDate();

            //querySelector() selects an HTML element. [data-day="${today}"] This means today's date.
            //data-day is attribute of daybox. See above. 

            let datebox=document.querySelector(`[data-day="${todaydate}"]`);
            if(datebox){
                datebox.style.backgroundColor="green";
            }
        });

        //OPTION 2 : UPLOAD PROOF
        let uploadproof=document.createElement("button");
        uploadproof.innerText="UPLOAD PROOF 📎";
        
        //UPLOAD FILE FUNCTION
        let uploadfile=document.createElement("input");
        uploadfile.type="file";
        uploadfile.accept="image/*";
        uploadfile.style.display="none";

        //UPLOAD PROOF FUNCTIONALITY

        // When button is clicked → open file picker 📂
        uploadproof.addEventListener("click", function(){
            uploadfile.click();
        });

        //WHEN USER SELECTS FILE
        uploadfile.addEventListener("change",async (event)=> {
            
            const file=event.target.files[0];
if (!file) return;
            console.log(file);

            //CONVERTING FILE USER UPLOADED TO HASH

            // CONVERT FILE TO ARRAYBUFFER()
            const buffer=await file.arrayBuffer();

            //CONVERT BUFFER TO SHA-256
            const SHA= await crypto.subtle.digest("SHA-256", buffer);//Take this binary data, apply SHA-256 hashing, wait for the result, and store it.

            //Take the raw hash data and turn it into an array of numbers we can use.
            const hasharray=Array.from(new Uint8Array(SHA));

            const hashHex =hasharray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

        console.log("SHA-256 Hash:", hashHex);
             });
             


             //OPTION 3: INTEGRATE API
        let api=document.createElement("button");
        api.innerText="INTEGRATE API 🔌";

        option_box.appendChild(manualbtn);
        option_box.appendChild(uploadproof);
        option_box.appendChild(api);

        li.appendChild(option_box);

    });


    li.appendChild(do_task);
}