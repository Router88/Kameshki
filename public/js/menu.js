
  let div = document.getElementById('nav');
  let ul = document.getElementById('menu')
  div.addEventListener('click',toggle);
  function toggle(){
    ul.classList.add("active");
  }
