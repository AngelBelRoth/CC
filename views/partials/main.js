document.getElementById('software').onclick = software
document.getElementById('hardware').onclick = hardware


function software() {
  document.querySelector('body').style.backgroundColor = 'rgba(241,63,247,1)'
  document.querySelector('body').style.color = 'white'
}

function hardware() {
  document.querySelector('body').style.backgroundColor = 'rgba(0,253,81,1)'
  document.querySelector('body').style.color = 'white'
}

<nav>
    <ul>
        <button id="software">Software
        let software=posts.filter((element)= element.businessType === 'software' )
            console.log('THIS IS Software', software)
        </button>


        <button id="hardware">Hardware
         let hardware=posts.filter((element)= element.businessType === 'hardware' )
            console.log('THIS IS HARDWARE', hardware)
        </button>
    </ul>
</nav>