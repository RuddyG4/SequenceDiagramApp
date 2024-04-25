import * as joint from "@joint/core";
import { sd } from "@/assets/JointJs/joint.shapes.sd"

export function initializeSequenceDiagram(paper, graph) {

    const dia = joint.dia;
    const linkTools = joint.linkTools;
    const elementTools = joint.elementTools;
    const highlighters = joint.highlighters;
    const paperDimensions = paper.getComputedSize();
    const paperHeight = paperDimensions.height;

    paper.el.style.border = '1px solid #E5E5E5';

    paper.on('link:pointermove', function(linkView, _evt, _x, y) {
        const type = linkView.model.get('type');
        switch (type) {
            case 'sd.Message': {
                const sView = linkView.sourceView;
                const tView = linkView.targetView;
                if (!sView || !tView) return;
                const padding = 20;
                const minY = Math.max(tView.sourcePoint.y - sView.sourcePoint.y, 0) + padding;
                const maxY = sView.targetPoint.y - sView.sourcePoint.y - padding;
                linkView.model.setStart(Math.min(Math.max(y - sView.sourcePoint.y, minY), maxY));
                break;
            }
            case 'sd.LifeSpan': {
                break;
            }
        }
    });

    paper.on('link:connect', function(linkView) {
        const type = linkView.model.get('type');
        switch (type) {
            case 'sd.Message': {
                editText(linkView, 'labels/0/attrs/labelText/text');
                break;
            }
            case 'sd.LifeSpan': {
                break;
            }
        }
    });

    const toolsScale = 1.2;

    graph.on('add', function(link) {
        if (!link.isLink()) return;
        const type = link.get('type');
        switch (type) {
            case 'sd.Lifeline': {
                const tools = new dia.ToolsView({
                    layer: null,
                    tools: [
                        new linkTools.HoverConnect({
                            scale: toolsScale
                        }),
                    ]
                });
                link.findView(paper).addTools(tools);
                break;
            }
        }
    });

    paper.on('cell:mouseenter', function(cellView) {
        const cell = cellView.model;
        const type = cell.get('type');
        switch (type) {
            case 'sd.Message': {
                const tools = new dia.ToolsView({
                    tools: [
                        new linkTools.Connect({
                            scale: toolsScale,
                            distance: -20
                        }),
                        new linkTools.Remove({
                            scale: toolsScale,
                            distance: 15
                        })
                    ]
                });
                cellView.addTools(tools);
                break;
            }
            case 'sd.LifeSpan': {
                const tools = new dia.ToolsView({
                    tools: [
                        new linkTools.Remove({
                            scale: toolsScale,
                            distance: 15
                        })
                    ]
                });
                cellView.addTools(tools);
                break;
            }
            case 'sd.Lifeline': {
                const tools = new dia.ToolsView({
                    layer: null,
                    tools: [
                        new linkTools.HoverConnect({
                            scale: toolsScale
                        }),
                    ]
                });
                cellView.addTools(tools);
                break;
            }
            case 'sd.Role': {
                const tools = new dia.ToolsView({
                    tools: [
                        new elementTools.Remove({
                            scale: toolsScale,
                            distance: '50%'
                        })
                    ]
                });
                cellView.addTools(tools);
                break;
            }
        }
    });

    paper.on('cell:mouseleave', function(cellView) {
        const cell = cellView.model;
        const type = cell.get('type');
        switch (type) {
            case 'sd.Role':
            case 'sd.LifeSpan':
            case 'sd.Message': {
                cellView.removeTools();
                break;
            }
        }
    });

    paper.on('blank:pointerdblclick', function(evt, x, y) {
        const role = new sd.Role({ position: { x: x - 50, y: y }});
        role.addTo(graph);
        const lifeline = new sd.Lifeline();
        lifeline.attachToRole(role, role.size().width * 3.8);
        lifeline.addTo(graph);
        // editText(role.findView(paper), 'attrs/label/text');
    });

    const backend = new sd.RoleGroup();
    backend.listenTo(graph, 'change:position', function(cell) {
        if (cell.isEmbeddedIn(backend)) backend.fitRoles();
    });
    graph.on('remove', function(element) {
        if (!element.isElement()) return;
        const embeds = backend.getEmbeddedCells();
        if (embeds.length < 2) {
            backend.unembed(embeds);
            backend.remove();
        }
    });

    paper.unfreeze();

    // Text Editing

    function editText(cellView, textPath) {

        const cell = cellView.model;
        const textarea = document.createElement('textarea');
        textarea.style.position = 'absolute';
        textarea.style.width ='200px';
        textarea.style.height = '100px';
        textarea.style.left = '50%';
        textarea.style.top = `${paperHeight / 2}px`;
        textarea.style.transform = 'translate(-50%, -50%)';
        textarea.style.padding = '5px';
        textarea.style.resize = 'none';
        textarea.style.boxShadow = '10px 10px 5px rgba(0, 0, 0, 0.5)';
        textarea.placeholder = cell.placeholder || 'Enter text here...';
        textarea.value = cell.prop(textPath) || '';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.setSelectionRange(0, textarea.value.length);

        cellView.paper.el.style.filter = 'blur(0.5px) grayscale(1)';
        cellView.paper.el.style.pointerEvents = 'none';

        const highlighter = highlighters.mask.add(cellView, 'root', 'selection', {
            layer: dia.Paper.Layers.FRONT,
            deep: true
        });

        function close() {
            textarea.remove();
            cellView.paper.el.style.filter = '';
            cellView.paper.el.style.pointerEvents = '';
            highlighter.remove();
        }

        function saveText() {
            cell.prop(textPath, textarea.value);
            close();
        }

        textarea.addEventListener('blur', saveText);

        textarea.addEventListener('keydown', function(evt) {
            if (evt.key === 'Enter' && !evt.shiftKey) {
                textarea.blur();
            }
            if (evt.key === 'Escape') {
                textarea.removeEventListener('blur', saveText);
                close();
            }
        });
    }

    paper.on('link:pointerdblclick', function(linkView, evt) {
        const labelIndex = linkView.findAttribute('label-idx', evt.target);
        if (!labelIndex) return;
        editText(linkView, `labels/${labelIndex}/attrs/labelText/text`);
    });

    paper.on('element:pointerdblclick', function(elementView, evt) {
        switch (elementView.model.get('type')) {
            case 'sd.Role': {
                editText(elementView, 'attrs/label/text');
                break;
            }
            case 'sd.RoleGroup': {
                editText(elementView, 'attrs/label/text');
                break;
            }
        }
    });

}