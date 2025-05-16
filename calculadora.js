document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a calculadora
    initCalculator();
    
    // Configurações iniciais
    document.getElementById('coeficienteA').value = 1;
    document.getElementById('coeficienteB').value = 0;
    document.getElementById('coeficienteC').value = 0;
    
    // Calcula a função inicial
    calculateQuadraticFunction();
});

// Seleciona elementos do DOM
const coefA = document.getElementById('coeficienteA');
const coefB = document.getElementById('coeficienteB');
const coefC = document.getElementById('coeficienteC');
const calculateBtn = document.querySelector('.botao-calcular');
const exportBtn = document.getElementById('exportarGrafico');
const functionDisplay = document.getElementById('equacao');
const deltaResult = document.getElementById('discriminante');
const rootsResult = document.getElementById('raizes');
const vertexResult = document.getElementById('vertice');
const yInterceptResult = document.getElementById('interceptoY');
const concavityResult = document.getElementById('concavidade');
const maxMinResult = document.getElementById('pontoMaxMin');
const growthResult = document.getElementById('crescimentoDecrescimento');
const canonicalFormResult = document.getElementById('formaCanonica');
const factoredFormResult = document.getElementById('formaFatorada');
const graphContainer = document.getElementById('graficoParabola').parentElement;
const canvas = document.getElementById('graficoParabola');
const stepsContainer = document.getElementById('passosResolucao');
const zoomRange = document.getElementById('zoomRange');
const graphColorInput = document.getElementById('corGrafico');
const calcFxBtn = document.getElementById('calcularFx');
const xValueInput = document.getElementById('valorX');
const fxResult = document.getElementById('resultadoFx');

// Variáveis do gráfico
let graphScale = 50;
let graphOffsetX = 0;
let graphOffsetY = 0;
let graphColor = '#4361ee';
let lastCalculatedX = null;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function initCalculator() {
    // Event listeners
    document.getElementById('form-funcao').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateQuadraticFunction();
    });
    
    // Controles do zoom
    zoomRange.addEventListener('input', function() {
        graphScale = 10 + parseInt(this.value) * 5;
        calculateQuadraticFunction();
    });
    
    // Controle de cor
    graphColorInput.addEventListener('change', (e) => {
        graphColor = e.target.value;
        calculateQuadraticFunction();
    });
    
    // Cálculo de f(x) específico
    calcFxBtn.addEventListener('click', calculateSpecificFx);
    xValueInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') calculateSpecificFx();
    });
    
    // Exportar gráfico
    exportBtn.addEventListener('click', exportGraph);
    
    // Eventos para navegação do gráfico com o mouse
    canvas.addEventListener('mousedown', startDragging);
    window.addEventListener('mousemove', dragGraph);
    window.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('dragstart', (e) => e.preventDefault());
    
    // Permitir cálculo com Enter nos coeficientes
    [coefA, coefB, coefC].forEach(input => {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') calculateQuadraticFunction();
        });
    });

    // Inicializa o canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = graphContainer.clientWidth;
    canvas.height = graphContainer.clientHeight;
    const a = parseFloat(coefA.value) || 0;
    const b = parseFloat(coefB.value) || 0;
    const c = parseFloat(coefC.value) || 0;
    if (a !== 0) drawGraph(a, b, c);
}

// Funções para navegação do gráfico
function startDragging(e) {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
}

function dragGraph(e) {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    
    graphOffsetX += deltaX;
    graphOffsetY += deltaY;
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    const a = parseFloat(coefA.value) || 0;
    const b = parseFloat(coefB.value) || 0;
    const c = parseFloat(coefC.value) || 0;
    
    if (a !== 0) {
        drawGraph(a, b, c);
    }
}

function stopDragging() {
    isDragging = false;
    canvas.style.cursor = 'crosshair';
}

function handleWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY;
    
    if (delta > 0) {
        graphScale *= 1.1;
    } else {
        graphScale *= 0.9;
    }
    
    // Limitar o zoom mínimo e máximo
    graphScale = Math.max(10, Math.min(graphScale, 500));
    
    // Atualizar o controle deslizante
    zoomRange.value = (graphScale - 10) / 5;
    
    calculateQuadraticFunction();
}

function calculateQuadraticFunction() {
    const a = parseFloat(coefA.value) || 0;
    const b = parseFloat(coefB.value) || 0;
    const c = parseFloat(coefC.value) || 0;
    
    // Verificar se é quadrática
    if (a === 0) {
        showError("O coeficiente 'a' deve ser diferente de zero para ser uma função quadrática!");
        return;
    }
    
    clearError();
    
    // Atualizar display da função
    functionDisplay.textContent = formatFunction(a, b, c);
    
    // Calcular propriedades
    const delta = b * b - 4 * a * c;
    const vx = -b / (2 * a);
    const vy = c - (b * b) / (4 * a);
    
    // Atualizar resultados
    deltaResult.textContent = delta;
    vertexResult.textContent = `(${formatNumber(vx)}, ${formatNumber(vy)})`;
    yInterceptResult.textContent = `(0, ${formatNumber(c)})`;
    concavityResult.textContent = a > 0 ? 'Para cima' : 'Para baixo';
    maxMinResult.textContent = a > 0 ? `Mínimo em y = ${formatNumber(vy)}` : `Máximo em y = ${formatNumber(vy)}`;
    growthResult.textContent = a > 0 ? 
        `Decresce para x < ${formatNumber(vx)} e cresce para x > ${formatNumber(vx)}` : 
        `Cresce para x < ${formatNumber(vx)} e decresce para x > ${formatNumber(vx)}`;
    
    // Calcular raízes
    let rootsText = '';
    if (delta < 0) {
        rootsText = 'Não existem raízes reais (Δ < 0)';
    } else if (delta === 0) {
        const root = -b / (2 * a);
        rootsText = `Raiz única: x = ${formatNumber(root)}`;
    } else {
        const root1 = (-b + Math.sqrt(delta)) / (2 * a);
        const root2 = (-b - Math.sqrt(delta)) / (2 * a);
        rootsText = `x₁ = ${formatNumber(root1)}, x₂ = ${formatNumber(root2)}`;
    }
    rootsResult.textContent = rootsText;
    
    // Formas alternativas
    canonicalFormResult.textContent = getCanonicalForm(a, vx, vy);
    factoredFormResult.textContent = getFactoredForm(a, delta, b, a);
    
    // Desenhar gráfico
    drawGraph(a, b, c);
    
    // Gerar passo a passo
    generateSteps(a, b, c, delta);
    
    // Destacar caso de delta
    highlightDeltaCase(delta);
}

function formatFunction(a, b, c) {
    let str = 'f(x) = ';
    
    if (a === 1) str += 'x²';
    else if (a === -1) str += '-x²';
    else str += `${a}x²`;
    
    if (b !== 0) {
        str += b > 0 ? ' + ' : ' - ';
        if (Math.abs(b) !== 1) str += `${Math.abs(b)}`;
        str += 'x';
    }
    
    if (c !== 0) {
        str += c > 0 ? ' + ' : ' - ';
        str += `${Math.abs(c)}`;
    }
    
    return str;
}

function formatNumber(num) {
    // Arredonda para 4 casas decimais e remove zeros desnecessários
    return parseFloat(num.toFixed(4)).toString();
}

function getCanonicalForm(a, h, k) {
    let str = 'f(x) = ';
    str += a === 1 ? '' : (a === -1 ? '-' : `${a}`);
    
    if (h === 0) str += 'x²';
    else str += `(x ${h > 0 ? '-' : '+'} ${Math.abs(h)})²`;
    
    if (k !== 0) str += ` ${k > 0 ? '+' : '-'} ${Math.abs(k)}`;
    
    return str;
}

function getFactoredForm(a, delta, b, c) {
    if (delta < 0) return 'Não é possível fatorar (Δ < 0)';
    
    if (delta === 0) {
        const root = -b / (2 * a);
        let str = 'f(x) = ';
        str += a === 1 ? '' : (a === -1 ? '-' : `${a}`);
        str += `(x ${root > 0 ? '-' : '+'} ${Math.abs(root)})²`;
        return str;
    }
    
    const root1 = (-b + Math.sqrt(delta)) / (2 * a);
    const root2 = (-b - Math.sqrt(delta)) / (2 * a);
    
    let str = 'f(x) = ';
    str += a === 1 ? '' : (a === -1 ? '-' : `${a}`);
    str += `(x ${root1 > 0 ? '-' : '+'} ${Math.abs(root1)})`;
    str += `(x ${root2 > 0 ? '-' : '+'} ${Math.abs(root2)})`;
    
    return str;
}

function drawGraph(a, b, c) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Contexto 2D não disponível");
        return;
    }
    
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha eixos
    drawAxes(ctx, canvas.width, canvas.height);
    
    // Desenha parábola
    drawParabola(ctx, a, b, c, canvas.width, canvas.height);
    
    // Marca pontos importantes
    markImportantPoints(ctx, a, b, c, canvas.width, canvas.height);
}

function drawAxes(ctx, width, height) {
    const originX = width / 2 + graphOffsetX;
    const originY = height / 2 + graphOffsetY;
    
    // Eixos
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    
    // Eixo X
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    
    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
    
    // Marcadores
    ctx.fillStyle = '#555';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Marcadores do eixo X
    const xStart = Math.ceil((-originX) / graphScale);
    const xEnd = Math.floor((width - originX) / graphScale);
    
    for (let i = xStart; i <= xEnd; i++) {
        if (i === 0) continue;
        const x = originX + i * graphScale;
        ctx.beginPath();
        ctx.moveTo(x, originY - 5);
        ctx.lineTo(x, originY + 5);
        ctx.stroke();
        ctx.fillText(i.toString(), x, originY + 8);
    }
    
    // Marcadores do eixo Y
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const yStart = Math.ceil((-originY) / graphScale);
    const yEnd = Math.floor((height - originY) / graphScale);
    
    for (let i = yStart; i <= yEnd; i++) {
        if (i === 0) continue;
        const y = originY - i * graphScale;
        ctx.beginPath();
        ctx.moveTo(originX - 5, y);
        ctx.lineTo(originX + 5, y);
        ctx.stroke();
        ctx.fillText(i.toString(), originX - 8, y);
    }
    
    // Origem (0,0)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('0', originX - 8, originY + 8);
}

function drawParabola(ctx, a, b, c, width, height) {
    const originX = width / 2 + graphOffsetX;
    const originY = height / 2 + graphOffsetY;
    
    ctx.strokeStyle = graphColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let firstPoint = true;
    
    for (let pixelX = 0; pixelX < width; pixelX++) {
        const x = (pixelX - originX) / graphScale;
        const y = a * x * x + b * x + c;
        const pixelY = originY - y * graphScale;
        
        if (pixelY > -1000 && pixelY < height + 1000) {
            if (firstPoint) {
                ctx.moveTo(pixelX, pixelY);
                firstPoint = false;
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
    }
    
    ctx.stroke();
}

function markImportantPoints(ctx, a, b, c, width, height) {
    const originX = width / 2 + graphOffsetX;
    const originY = height / 2 + graphOffsetY;
    const delta = b * b - 4 * a * c;
    
    // Vértice
    const vx = -b / (2 * a);
    const vy = c - (b * b) / (4 * a);
    const vertexX = originX + vx * graphScale;
    const vertexY = originY - vy * graphScale;
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(vertexX, vertexY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`V(${formatNumber(vx)}, ${formatNumber(vy)})`, vertexX + 10, vertexY - 5);
    
    // Raízes
    if (delta >= 0) {
        const sqrtDelta = Math.sqrt(delta);
        const x1 = (-b + sqrtDelta) / (2 * a);
        const x2 = (-b - sqrtDelta) / (2 * a);
        
        // Primeira raiz
        const root1X = originX + x1 * graphScale;
        const root1Y = originY;
        
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(root1X, root1Y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`x₁=${formatNumber(x1)}`, root1X, root1Y + 10);
        
        // Segunda raiz (se diferente)
        if (delta > 0) {
            const root2X = originX + x2 * graphScale;
            const root2Y = originY;
            
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(root2X, root2Y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#333';
            ctx.fillText(`x₂=${formatNumber(x2)}`, root2X, root2Y + 10);
        }
    }
    
    // Interseção com eixo Y
    const yInterceptX = originX;
    const yInterceptY = originY - c * graphScale;
    
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(yInterceptX, yInterceptY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`(0,${formatNumber(c)})`, yInterceptX - 10, yInterceptY);
    
    // Ponto calculado específico
    if (lastCalculatedX !== null) {
        const fx = a * lastCalculatedX * lastCalculatedX + b * lastCalculatedX + c;
        const pointX = originX + lastCalculatedX * graphScale;
        const pointY = originY - fx * graphScale;
        
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`f(${formatNumber(lastCalculatedX)})=${formatNumber(fx)}`, pointX, pointY - 10);
    }
}

function generateSteps(a, b, c, delta) {
    stepsContainer.innerHTML = '';
    
    // Passo 1: Identificar coeficientes
    const step1 = createStep(
        "1. Identificação dos coeficientes",
        `Função: f(x) = ${a}x² ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}<br>
         a = ${a}, b = ${b}, c = ${c}`
    );
    stepsContainer.appendChild(step1);
    
    // Passo 2: Cálculo do delta
    const step2 = createStep(
        "2. Cálculo do discriminante (Δ)",
        `Δ = b² - 4ac = ${b}² - 4 × ${a} × ${c} = ${b*b} - ${4*a*c} = ${delta}`
    );
    stepsContainer.appendChild(step2);
    
    // Passo 3: Interpretação do delta
    let deltaInterpretation = '';
    if (delta > 0) {
        deltaInterpretation = "Δ > 0 ⇒ Duas raízes reais distintas";
    } else if (delta === 0) {
        deltaInterpretation = "Δ = 0 ⇒ Uma raiz real dupla";
    } else {
        deltaInterpretation = "Δ < 0 ⇒ Nenhuma raiz real";
    }
    
    const step3 = createStep(
        "3. Interpretação do discriminante",
        deltaInterpretation
    );
    stepsContainer.appendChild(step3);
    
    // Passo 4: Cálculo das raízes (se existirem)
    if (delta >= 0) {
        const step4 = createStep(
            "4. Cálculo das raízes",
            `Fórmula: x = [-b ± √Δ] / 2a<br>
             x = [${-b} ± √${delta}] / ${2*a}`
        );
        stepsContainer.appendChild(step4);
        
        if (delta > 0) {
            const x1 = (-b + Math.sqrt(delta)) / (2 * a);
            const x2 = (-b - Math.sqrt(delta)) / (2 * a);
            const step5 = createStep(
                "5. Raízes calculadas",
                `x₁ = [${-b} + √${delta}] / ${2*a} = ${formatNumber(x1)}<br>
                 x₂ = [${-b} - √${delta}] / ${2*a} = ${formatNumber(x2)}`
            );
            stepsContainer.appendChild(step5);
        } else {
            const x = -b / (2 * a);
            const step5 = createStep(
                "5. Raiz calculada",
                `x = ${-b} / ${2*a} = ${formatNumber(x)} (raiz dupla)`
            );
            stepsContainer.appendChild(step5);
        }
    }
    
    // Passo 6: Vértice
    const vx = -b / (2 * a);
    const vy = c - (b * b) / (4 * a);
    const step6 = createStep(
        "6. Cálculo do vértice",
        `x<sub>v</sub> = -b / 2a = ${-b} / ${2*a} = ${formatNumber(vx)}<br>
         y<sub>v</sub> = f(x<sub>v</sub>) = ${a} × ${formatNumber(vx)}² + ${b} × ${formatNumber(vx)} + ${c} = ${formatNumber(vy)}<br>
         Vértice: (${formatNumber(vx)}, ${formatNumber(vy)})`
    );
    stepsContainer.appendChild(step6);
    
    // Passo 7: Análise completa
    const step7 = createStep(
        "7. Análise completa",
        `• Concavidade: ${a > 0 ? 'Para cima (a > 0)' : 'Para baixo (a < 0)'}<br>
         • Interseção com eixo y: (0, ${c})<br>
         • ${a > 0 ? 'Ponto de mínimo' : 'Ponto de máximo'}: (${formatNumber(vx)}, ${formatNumber(vy)})<br>
         • Comportamento: ${a > 0 ? 
             `Decresce para x < ${formatNumber(vx)} e cresce para x > ${formatNumber(vx)}` : 
             `Cresce para x < ${formatNumber(vx)} e decresce para x > ${formatNumber(vx)}`}`
    );
    stepsContainer.appendChild(step7);
}

function createStep(title, content) {
    const step = document.createElement('div');
    step.className = 'passo';
    
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'passo-content';
    contentElement.innerHTML = content;
    
    step.appendChild(titleElement);
    step.appendChild(contentElement);
    
    return step;
}

function highlightDeltaCase(delta) {
    // Remover todos os destaques
    document.getElementById('deltaPositivo')?.classList.remove('destaque');
    document.getElementById('deltaZero')?.classList.remove('destaque');
    document.getElementById('deltaNegativo')?.classList.remove('destaque');
    
    // Adicionar destaque ao caso correto
    if (delta > 0) {
        document.getElementById('deltaPositivo')?.classList.add('destaque');
    } else if (delta === 0) {
        document.getElementById('deltaZero')?.classList.add('destaque');
    } else {
        document.getElementById('deltaNegativo')?.classList.add('destaque');
    }
}

function calculateSpecificFx() {
    const xValue = parseFloat(xValueInput.value);
    
    if (isNaN(xValue)) {
        showError("Por favor, insira um valor numérico válido para x");
        return;
    }
    
    clearError();
    
    const a = parseFloat(coefA.value) || 0;
    const b = parseFloat(coefB.value) || 0;
    const c = parseFloat(coefC.value) || 0;
    
    if (a === 0) {
        showError("O coeficiente 'a' deve ser diferente de zero");
        return;
    }
    
    const yValue = a * xValue * xValue + b * xValue + c;
    fxResult.textContent = `f(${formatNumber(xValue)}) = ${formatNumber(yValue)}`;
    
    // Armazenar para mostrar no gráfico
    lastCalculatedX = xValue;
    
    // Redesenhar o gráfico para incluir o novo ponto
    calculateQuadraticFunction();
}

function exportGraph() {
    const canvas = document.getElementById('graficoParabola');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'grafico_funcao_quadratica.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'mensagemErro';
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.querySelector('.formulario');
    form.appendChild(errorDiv);
}

function clearError() {
    const errorDiv = document.getElementById('mensagemErro');
    if (errorDiv) {
        errorDiv.remove();
    }
}