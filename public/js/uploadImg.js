//File uploading 
let fileUploader = document.getElementById('file-uploader');
const reader = new FileReader();
const imageGrid = document.getElementById('image');
let isUpload = false;
fileUploader.addEventListener('change', (event) => {
  const files = event.target.files;
  const file = files[0];
  reader.readAsDataURL(file);
  
  reader.addEventListener('load', (event) => {
    
    if(isUpload==false){
    let img = document.createElement('img');
    img.classList.add("img");
    imageGrid.appendChild(img);
    img.src = event.target.result;
    img.alt = file.name;
    isUpload=true;
  }else{
    imageGrid.removeChild(img);
    isUpload=false;
    }
  });
});
//