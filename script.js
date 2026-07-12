const loader = document.getElementById('loader');
const page = document.getElementById('page');
const header = document.getElementById('myHeader');
const openMenu = document.getElementById('openmenu');
const backTop = document.getElementById('backTop');
const words = ['Web Developer', 'WordPress Developer', 'Portal Creator', 'UI Designer'];
let wordIndex = 0;

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.style.display = 'none';
    page.style.display = 'block';
    header.style.display = 'block';
  }, 550);
});

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) header.classList.add('sticky');
  else {
    header.classList.remove('sticky');
    header.classList.remove('open');
  }
  backTop.classList.toggle('show', window.scrollY > 500);
});

openMenu.addEventListener('click', () => header.classList.toggle('open'));
document.querySelectorAll('.glass-nav a').forEach(link => link.addEventListener('click', () => header.classList.remove('open')));
backTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));

setInterval(() => {
  wordIndex = (wordIndex + 1) % words.length;
  document.getElementById('multiText').textContent = words[wordIndex];
}, 1800);

document.getElementById('year').textContent = new Date().getFullYear();

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const projectCount = document.getElementById('projectCount');

function filterProjects(filter) {
  let visible = 0;
  projectCards.forEach(card => {
    const categories = card.dataset.category.split(' ');
    const show = filter === 'all' || categories.includes(filter);
    card.classList.toggle('hide', !show);
    if (show) visible++;
  });
  projectCount.textContent = `${visible} project${visible === 1 ? '' : 's'} shown`;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    filterProjects(button.dataset.filter);
  });
});

filterProjects('all');
