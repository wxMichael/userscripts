// ==UserScript==
// @name        Nexus Mods Comment Links
// @description Adds a button to comments on Nexus Mods to copy a direct link.
// @version     1.0
// @downloadURL https://raw.githubusercontent.com/wxMichael/userscripts/master/scripts/NexusModsCommentLinks.user.js
// @grant       GM.setClipboard
// @grant       GM_setClipboard
// @include     https://*.nexusmods.com/*/mods/*
// ==/UserScript==

const postsTab = document.getElementById("mod-page-tab-posts");
const targetNode = document.querySelector("div.tabcontent");
const buttonClass = "comment-link-button";

function setClipboard(text) {
	if (typeof GM !== "undefined" && typeof GM.setClipboard === "function") {
		GM.setClipboard(text);
	}
	else if (typeof GM_setClipboard === "function") {
		GM_setClipboard(text);
	}
}

if (postsTab !== null && targetNode !== null) {
	const config = {
		attributes: true,
		childList: true,
		subtree: true,
		attributeOldValue: true,
		attributeFilter: ["class"]
	};

	if (document.getElementById("comment-container-wrapper") !== null) {
		checkComments();
	}

	const observer = new MutationObserver(callback);
	observer.observe(targetNode, config);
}

function callback(mutationList, observer) {
	for (const mutation of mutationList) {
		if (mutation.target.nodeType !== Node.ELEMENT_NODE) continue;
		let classList = mutation.target.classList;
		if (!classList.contains("tabcontent") || !classList.contains("tabcontent-mod-page")) continue;
		if (mutation.type === "attributes") {
			let loadingDone = mutation.oldValue.indexOf("tab-load") !== -1
				&& mutation.oldValue.indexOf("loading") === -1
				&& !classList.contains("tab-load")
				&& !classList.contains("loading");
			if (!loadingDone) continue;
			checkComments();
		}
		else if (mutation.type == "childList") {
			if (mutation.removedNodes.length === 0) continue;
			for (const node of mutation.removedNodes) {
				if (node.className !== "nexus-ui-blocker") continue;
				checkComments();
				return;
			}
		}
	}
}

function checkComments() {
	let comment_container = document.getElementById("comment-container-wrapper");
	if (comment_container === null) return;
	let comments = comment_container.querySelectorAll("li.comment");
	if (comments.length === 0) return;
	comments.forEach((currentValue, currentIndex, listObj) => {
		let comment_id = currentValue.id.split("-")[1];
		let comment_actions = currentValue.querySelector("div.comment-actions > ul");
		if (comment_actions.querySelector(`li.${buttonClass}`) !== null) return;
		addLinkButton(comment_actions, comment_id);
	});
}

function addLinkButton(comment_actions, comment_id) {
	let page_link = document.getElementById("page-link").value;
	let elem_li = document.createElement("li");
	let elem_a = document.createElement("a");
	let elem_span = document.createElement("span");

	elem_li.className = buttonClass;
	elem_a.className = "btn inline-flex";
	elem_a.onclick = (event) => {
		setClipboard(`${page_link}?tab=posts&comment_id=${comment_id}`);
		elem_span.innerText = "Copied!";
		elem_span.disabled = true;
		setTimeout(() => {
			elem_span.innerText = "Copy Link";
			elem_span.disabled = false;
		}, 1500);

	};
	elem_span.className = "flex-label";
	elem_span.innerText = "Copy Link";

	elem_a.appendChild(elem_span);
	elem_li.appendChild(elem_a);
	comment_actions.insertBefore(elem_li, comment_actions.children[0]);
}
