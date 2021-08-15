# Development Log

### 26 March 2020

* The original GridGame implementation was written as a web component in pure JavaScript.  For this project, I decided to rewrite it using TypeScript + React.
* The original GridGame component used a table to represent the game board.  The user could focus on the `<td>` table cells, which listened for keyboard events.  Unfortunately, it is not possible to bring up a mobile keyboard unless there is an `<input>` element.
* So, for this version, I deicded to use <input> elements for cells in the boggle board, hoping to support text input mobile devices.

* Apparently, using React Components inside a Shadow DOM (e.g. for a webcomponent) causes events not to fire correctly.  A library called (`react-shadow-dom-retarget-events`](https://github.com/spring-media/react-shadow-dom-retarget-events) claims to solve the issue, but appears to be buggy, since the `onFocus` event doesn't seem to work even with the library.  I filed an [issue on GitHub](https://github.com/spring-media/react-shadow-dom-retarget-events/issues/28).
* Since the aforementioned library didn't work, I decided to try lifing the React component out of the shadow DOM.  Instead, I just call `ReactDOM.render(..., webComponent)` to render the web component in the light DOM.  Now, events work as expected, but unfortunately Chrome now tries to autofill all the `<input>` elements!!!  