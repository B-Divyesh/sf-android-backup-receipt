const heading = document.querySelector('h1');
if (heading) {
  heading.setAttribute('tabindex', '-1');
  requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  const announcement = document.getElementById('route-announcement');
  if (announcement) announcement.textContent = document.title;
}
