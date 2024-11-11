// Функция, которая срабатывает при нажатии Enter
function onEnterPress(event) {
	if (event.key === "Enter") {
		// Проверка, что нажата клавиша Enter
		const messageDiv = document.getElementById("message");
		messageDiv.textContent = "Текст был изменен";
	}
}

// Подписка на событие 'keydown' для текстового поля
window.addEventListener("DOMContentLoaded", () => {
	const textInput = document.getElementById("text-input");
	textInput.addEventListener("keydown", onEnterPress);
});
