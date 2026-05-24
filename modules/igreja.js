export function render(container) {
    container.innerHTML = `
        <div class="form-container text-center" style="padding: 80px 24px; border-radius: 16px; background: var(--secondary-color); border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: rgba(212, 175, 55, 0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <i class="ph ph-church" style="font-size: 3.5rem; color: var(--primary-color);"></i>
            </div>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 600; color: var(--text-main); margin: 0;">Igreja</h2>
            <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 480px; line-height: 1.6; margin: 0;">
                Anotações de cultos, esboços e atividades da sua comunidade de fé. Em breve, você poderá centralizar aqui as anotações das pregações e os eventos importantes da sua comunidade.
            </p>
            <div style="width: 60px; height: 3px; background: var(--primary-color); border-radius: 2px;"></div>
        </div>
    `;
}

export function init(db, auth) {
    // Inicialização da aba de igreja, se houver
    console.log("Módulo de Igreja carregado com sucesso.");
}
