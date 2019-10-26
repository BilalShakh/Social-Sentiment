console.log('Client-side code running');


const button = document.getElementById('kWordBtn');
const text = document.getElementById('part1');
button.addEventListener('click', function(e) {
text.value("Hello");
  console.log('button was clicked');
});