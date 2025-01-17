const sucIcon=document.querySelector('#suc-dismiss')
const errIcon=document.querySelector('#err-dismiss')
const successDiv=document.querySelector('.success-container')
const errorDiv=document.querySelector('.error-container')

if(sucIcon && successDiv){
    sucIcon.addEventListener('click',()=>{
    successDiv.remove()
})
}

if(errIcon && errorDiv){
    errIcon.addEventListener('click',()=>{
        errorDiv.remove()
    })
}