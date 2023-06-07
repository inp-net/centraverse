import tippy from 'sveltejs-tippy';
import xss from 'xss';

export const tooltip = (node: HTMLElement, parameters: string | [string, number] | object) => {
	let content: string;
	let delay = 50;
	if (parameters === '') {
		return;
	}
	if (typeof parameters === 'string') {
		content = parameters;
	} else if (Array.isArray(parameters)) {
		[content, delay] = parameters;
	} else {
		// node.title = parameters.content
		return tippy(node, parameters);
	}
	// node.title = content
	return tippy(node, { content: xss(content), allowHTML: true, delay: [delay, 0] });
};
