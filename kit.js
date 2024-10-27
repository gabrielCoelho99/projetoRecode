function toggleKitDetails(button) {
    const card = button.closest('.emergency-kit-card');
    const details = card.querySelector('.kit-details');
    const isExpanded = details.classList.contains('expanded');
    
    details.classList.toggle('expanded');
    button.textContent = isExpanded ? 'Ver Lista Completa' : 'Fechar Lista';
  }