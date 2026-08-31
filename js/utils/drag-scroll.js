/**
 * SIMPEL-IF Universal Drag & Swipe Horizontal Scroll Utility
 * Memungkinkan semua container data, tabel, kartu KPI, dan tombol peran
 * dapat digeser (drag / swipe) ke kanan dan ke kiri secara halus baik di PC (mouse) maupun HP/Tablet (touch).
 */

export class DragScrollHelper {
  static init(container = document) {
    // Select all horizontal scrollable elements
    const scrollables = container.querySelectorAll(
      '.table-responsive, .role-buttons-group, .role-switcher-banner, .stats-scroll-wrapper, .horizontal-scroll, .filter-toolbar, .filter-group, .nav-tabs, .charts-scroll-wrapper, [data-scroll-x]'
    );

    scrollables.forEach(el => {
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
    let startX;
    let scrollLeft;
    let isDragging = false;

    // Mouse Events for Desktop Dragging
    element.addEventListener('mousedown', (e) => {
      // Don't drag if clicking directly on interactive inputs or buttons
      if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName)) {
        return;
      }
      isDown = true;
      isDragging = false;
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    });

    element.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        element.style.cursor = 'grab';
        element.style.removeProperty('user-select');
      }
    });

    element.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        element.style.cursor = 'grab';
        element.style.removeProperty('user-select');
        setTimeout(() => { isDragging = false; }, 50);
      }
    });

    element.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed multiplier
      if (Math.abs(walk) > 4) {
        isDragging = true;
      }
      element.scrollLeft = scrollLeft - walk;
    });

    // Prevent unintentional click when dragging
    element.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Touch events momentum support is native via CSS -webkit-overflow-scrolling: touch
  }
}
