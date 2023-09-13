import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js"
const db = getFirestore()
const dbRef = collection(db, "contacts")

// Mobile View
const leftCol = document.getElementById("left-col")
const backBtn = document.getElementById("back-btn")

backBtn.addEventListener("click", e => {
    leftCol.style.display = "block"
        rightCol.style.display = "none"
})

const toggleLeftAndRightViewsOnMobile = () => {
    if(document.body.clientWidth <= 600) {
        leftCol.style.display = "none"
        rightCol.style.display = "block"
    }
}

// Get Data

let contacts = []


const getContacts = async() => {
    try {
        // const docSnap = await getDocs(dbRef)
        await onSnapshot(dbRef, docsSnap =>{

            contacts = []

            docsSnap.forEach((doc) => {
                const contact = doc.data()
                contact.id = doc.id
                contacts.push(contact)
    
                //console.log(doc.data())
                //console.log(doc.id)
            })
    
            showContacts(contacts)
        })


    } catch(err) {
        console.log("getContacts = " + err)
    }
}

getContacts()

// Show Contact as List Item
const contactList = document.getElementById("contact-list")

const showContacts = () => {
    contactList.innerHTML = ""

    contacts.forEach(contact => {
        const li = `<li class="contact-list-item" id="${contact.id}">
        <div class="media">
            <div class="initals">DW</div>
        </div>
        <div class="content">
            <div class="title">${contact.firstname} ${contact.lastname}</div>
            <div class="subtitle">${contact.phone}</div>
        </div>
        <div class="action">
            <button class="edit-user">Edit</button>
            <button class="delete-user">Delete</button>
        </div>
    </li>`

    contactList.innerHTML += li
    })
}

// Click Contact List UL Element
const contactListPressed = (event) => {
    const id = event.target.closest("li").getAttribute("id")
    //console.log(id)

    if(event.target.className === "edit-user"){
        editButtonPressed(id)
    } 
    else if(event.target.className === "delete-user") {
        deleteButtonPressed(id)
    } else{
        displayContactOnDetailsView(id)
        toggleLeftAndRightViewsOnMobile()
    }
}

contactList.addEventListener("click", contactListPressed)

// Edit Data
const editButtonPressed = (id) => {
    modalOverlay.style.display = "flex"

    const contact = getContact(id)
    firstName.value =contact.firstname
    lastName.value =contact.lastname
    age.value =contact.age
    phone.value =contact.phone
    email.value =contact.email

    modalOverlay.setAttribute("contact-id", contact.id)
}

// Delete Data
const deleteButtonPressed = async(id) => {

    const isConfirmed = confirm("Are you sure you want to delete this contact?")

    if(isConfirmed) {
        try {
            const docRef = doc(db, "contacts", id)
            await deleteDoc(docRef)
        } catch(e){
            setErrorMessage("error", "Unable to delete user data to the database. Please try again")
            showErrorMessages()
        }
    } 
}

// Display Details View On List Item Click
const rightCol = document.getElementById("right-col")

const getContact = (id) => {
    return contacts.find(contact => {
        return contact.id === id
    })
}

const displayContactOnDetailsView = (id) => {
    const contact = getContact(id)
    console.log(contact)
    const rightColDetail = document.getElementById("right-col-detail")
    rightColDetail.innerHTML = `
            <div class="label">Name:</div>
            <div class="data">${contact.firstname} ${contact.lastname}</div>
            <div class="label">Age:</div>
            <div class="data">${contact.age}</div>
            <div class="label">Phone Number:</div>
            <div class="data">${contact.phone}</div>
            <div class="label">Email:</div>
            <div class="data">${contact.email}</div>
    `
}

// Modal
const addBtn = document.querySelector(".add-btn")
const modalOverlay = document.getElementById("modal-overlay")
const closeBtn = document.querySelector(".close-btn")

const addButtonPressed = () => {
    modalOverlay.style.display = "flex"
    modalOverlay.removeAttribute("contact-id")
    firstName.value = ""
    lastName.value = ""
    age.value = ""
    phone.value = ""
    email.value = ""
}

const closeButtonPressed = () => {
    modalOverlay.style.display = "none"
}

const hideModal = (e) => {

    if(e instanceof Event) {
        if (e.target === e.currentTarget) {
            modalOverlay.style.display = "none"
        }
    } else{
        modalOverlay.style.display = "none"
    }
}

addBtn.addEventListener("click", addButtonPressed)
closeBtn.addEventListener("click", closeButtonPressed)
modalOverlay.addEventListener("click", hideModal)

// Form Validation 

const saveBtn = document.querySelector(".save-btn")
const error = {}
const firstName = document.getElementById("firstname")
const lastName = document.getElementById("lastname")
const age = document.getElementById("age")
const phone = document.getElementById("phone")
const email = document.getElementById("email")

const saveBtnPressed = async() => {
    checkRequired([firstName, lastName, age, phone, email])
    checkEmail(email)
    checkInputLength(age, 2)
    checkInputLength(phone, 11)
    showErrorMessages(error)

    if(Object.keys(error).length === 0) {

        if(modalOverlay.getAttribute("contact-id")) {
            const docRef = doc(db, "contacts", modalOverlay.getAttribute("contact-id"))

            try{
                await updateDoc(docRef, {
                    firstname:firstName.value,
                    lastname:lastName.value,
                    age:age.value,
                    phone:phone.value,
                    email:email.value
                })

                hideModal()

            } catch(e) {
                setErrorMessage("error", "Unable to update user data to the database. Please try again")
                showErrorMessages()
            }

            
        } else {
            try {
                await addDoc(dbRef, {
                    firstname: firstName.value,
                    lastname: lastName.value,
                    age: age.value,
                    phone: phone.value,
                    email: email.value
                })
    
                hideModal()
    
            } catch (err) {
                setErrorMessage("error", "Unable to add user data to the database. Please try again")
                showErrorMessages()
            }
        }   
    }
}

const checkRequired = (inputArray) => {
    inputArray.forEach(input => {
        if(input.value.trim() === "") {
            setErrorMessage(input, input.id + " is empty")
        } else {
            deleteErrorMessage(input)
        }
    })
    console.log(error)
}

const setErrorMessage = (input, message) => {
    if(input.nodeName === "INPUT"){
        error[input.id] = message
        input.style.border = "1px solid red"
    } else {
        error[input] = message
    }
}

const deleteErrorMessage = (input) => {
    delete error[input.id]
    input.style.border = "1px solid green"
}

const checkInputLength = (input, number) => {
    if(input.value.trim() !== ""){
        if(input.value.trim().length === number) {
            deleteErrorMessage(input)
        } else {
            setErrorMessage(input, input.id + ` must be ${number} digits`)
        }
    }
}

const checkEmail = (input) => {
    if(input.value.trim()  !== "") {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if(re.test(input.value.trim())) {
            deleteErrorMessage(input)
        } else {
            setErrorMessage(input, input.id + " is invalid")
        }
    }
}

const showErrorMessages = () => {
    const errorLabel = document.getElementById("error-label")
    errorLabel.innerHTML = ""
    for(const key in error) {
        const li = document.createElement("li")
        li.innerText = error[key]
        li.style.color = "red"
        errorLabel.appendChild(li)
    }
}

saveBtn.addEventListener("click", saveBtnPressed)