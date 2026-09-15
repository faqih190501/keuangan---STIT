/**
 * SIMPEL-IF Universal Drag & Swipe Horizontal Scroll Utility
 * Memungkinkan semua container data, tabel, kartu KPI, dan tombol peran
 * dapat digeser (drag / swipe) ke kanan dan ke kiri secara halus baik di PC (mouse) maupun HP/Tablet (touch).
 */

export class DragScrollHelper {
  static init(container = document) {
    // Select all horizontal scrollable elements, ignoring calendar swipe zones
    const scrollables = container.querySelectorAll(
      '.table-responsive, .role-buttons-group, .role-switcher-banner, .stats-scroll-wrapper, .horizontal-scroll, .filter-toolbar, .filter-group, .nav-tabs, .charts-scroll-wrapper, [data-scroll-x]'
    );

    scrollables.forEach(el => {
      // Exclude elements that have their own specialized swipe controller
      if (el.hasAttribute('data-no-drag-scroll') || el.closest('#calendar-swipe-zone') || el.classList.contains('calendar-matrix-wrapper')) {
        return;
      }
      this.attach(el);
    });
  }

  static attach(element) {
    if (!element || element._hasDragScroll) return;
    element._hasDragScroll = true;

    // Apply smooth touch and momentum scroll styles
    element.style.overflowX = 'auto';
    element.style.webkitOverflowScrolling = 'touch';
    element.style.overscrollBehaviorX = 'contain';
    element.style.cursor = 'grab';

    let isDown = false;
    let startX = 0;
    let startPageX = 0;
    let scrollLeft = 0;
    let isDragging = false;
    const DRAG_THRESHOLD = 6;

    // Mouse Events for Desktop Dragging
    element.addEventListener('mousedown', (e) => {
      // Don't drag if clicking text inputs, select, or textarea
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }
      isDown = true;
      isDragging = false;
      startPageX = e.pageX;
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
      element.style.cursor = 'grabbing';
    });

    const onMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed multiplier
      
      if (Math.abs(e.pageX - startPageX) > DRAG_THRESHOLD) {
        isDragging = true;
        element.style.userSelect = 'none';
        element.scrollLeft = scrollLeft - walk;
      }
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        element.style.cursor = 'grab';
        element.style.removeProperty('user-select');
        setTimeout(() => { isDragging = false; }, 80);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Prevent unintentional click on children (buttons/links) when actually dragging
    element.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }
}
