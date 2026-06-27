const loader = document.getElementById('loader');
const page = document.getElementById('page');
const header = document.getElementById('myHeader');
const openMenu = document.getElementById('openmenu');
const words = ['Web Developer', 'YouTuber', 'Blogger', 'WordPress Designer'];
let wordIndex = 0;

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.style.display = 'none';
    page.style.display = 'block';
    header.style.display = 'block';
  }, 600);
});

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) header.classList.add('sticky');
  else {
    header.classList.remove('sticky');
    header.classList.remove('open');
  }
});

openMenu.addEventListener('click', () => header.classList.toggle('open'));
document.querySelectorAll('.glass-nav a').forEach(link => {
  link.addEventListener('click', () => header.classList.remove('open'));
});

setInterval(() => {
  wordIndex = (wordIndex + 1) % words.length;
  document.getElementById('multiText').textContent = words[wordIndex];
}, 1600);
