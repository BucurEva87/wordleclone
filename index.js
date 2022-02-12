import { words } from './dictionary-ro.js'

const guessGrid = document.querySelector('.guess-grid'),
      alertContainer = document.querySelector('.alert-container'),
      keyboard = document.querySelector('.keyboard'),
      WORD_LENGTH = 5,
      FLIP_ANIMATION_DURATION = 500,
      DANCE_ANIMATION_DURATION = 500,
    //   offsetFromDate = new Date(2022, 0, 1),
    //   msOffset = Date.now() - offsetFromDate,
    //   dayOffset = msOffset / 1000 / 60 / 60 / 24,
      targetWord = words[Math.floor(Math.random() * words.length)]

function createKeyboard() {
    const rows = 'qwertyuiop|asdfghjkl|zxcvbnm'.split('|')
    const locations = [
        document.querySelector('.keyboard .space'),
        Array.from(document.querySelectorAll('.keyboard .space')).pop(),
        document.querySelector('.keyboard [data-delete]')
    ]

    for (let [index, row] of rows.entries())
        for (let i = 0, len = row.length; i < len; i++) {
            const letter = row[i],
                  button = document.createElement('button')

            button.dataset.key = letter
            button.classList.add('key')
            button.textContent = letter

            locations[index].before(button)
        }
}

function createGrid() {
    const hook = document.querySelector('.guess-grid')

    for (let i = 0; i < 30; i++) {
        const div = document.createElement('div')

        div.classList.add('tile')

        hook.appendChild(div)
    }
}

function startInteraction() {
    document.addEventListener('click', handleMouseClick)
    document.addEventListener('keydown', handleKeyPress)
}

function stopInteraction() {
    document.removeEventListener('click', handleMouseClick)
    document.removeEventListener('keydown', handleKeyPress)
}

function handleMouseClick(e) {
    if (e.target.matches('[data-key]')) {
        pressKey(e.target.dataset.key)
        return
    }

    if (e.target.matches('[data-enter]')) {
        submitGuess()
        return
    }

    if (e.target.matches('[data-delete]')) {
        deleteKey()
        return
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        submitGuess()
        return
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
        deleteKey()
        return
    }

    if (e.key.match(/^[a-z]$/i)) {
        pressKey(e.key)
        return
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles()

    if (activeTiles.length >= WORD_LENGTH) return

    const nextTile = guessGrid.querySelector(':not([data-letter])')

    nextTile.dataset.letter = key.toLowerCase()
    nextTile.textContent = key
    nextTile.dataset.state = 'active'
}

function deleteKey() {
    const activeTiles = getActiveTiles(),
          lastTile = activeTiles[activeTiles.length - 1]
        
    if (lastTile == null) return

    lastTile.textContent = ''
    delete lastTile.dataset.state
    delete lastTile.dataset.letter
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()]

    if (activeTiles.length !== WORD_LENGTH) {
        showAlert('Not enough letters')
        shakeTiles(activeTiles)
        return
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter
    }, '')

    if (!words.includes(guess)) {
        showAlert('Word is not in the dictionary')
        shakeTiles(activeTiles)
        return
    }

    stopInteraction()

    activeTiles.forEach((...params) => flipTile(...params, guess))
}

function flipTile(tile, index, array, guess) {
    const letter = tile.dataset.letter,
          key = keyboard.querySelector(`[data-key="${letter}"i]`)

    setTimeout(() => {
        tile.classList.add('flip')
    }, index * FLIP_ANIMATION_DURATION / 2)

    tile.addEventListener('transitionend', () => {
        tile.classList.remove('flip')

        if (targetWord[index] === letter) {
            tile.dataset.state = 'correct'
            key.classList.add('correct')
        } else if (targetWord.includes(letter)) {
            tile.dataset.state = 'wrong-location'
            key.classList.add('wrong-location')
        } else {
            tile.dataset.state = 'wrong'
            key.classList.add('wrong')
        }

        if (index === array.length - 1)
            tile.addEventListener('transitionend', () => {
                startInteraction()
                checkWinLose(guess, array)
            }, { once: true })
    }, { once: true })
}

function checkWinLose(guess, tiles) {
    if (guess === targetWord) {
        showAlert('CONGRATS! You won!', 5000)
        danceTiles(tiles)
        stopInteraction()
        return
    }

    const remainingTiles = guessGrid.querySelectorAll(':not([data-letter])')
    
    if (!remainingTiles.length) {
        showAlert(`You lost! Word was: ${targetWord.toUpperCase()}`, null)
        stopInteraction()
    }
}

function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('dance')
            tile.addEventListener('animationend', () => {
                tile.classList.remove('dance')
            }, { once: true })
        }, index * DANCE_ANIMATION_DURATION / 5)
    })
}

function showAlert(message, duration = 1000) {
    const alert = document.createElement('div')

    alert.textContent = message
    alert.classList.add('alert')
    alertContainer.prepend(alert)

    if (duration == null) return

    setTimeout(() => {
        alert.classList.add('hide')
        alert.addEventListener('transitionend', () => alert.remove())
    }, duration)
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add('shake')
        tile.addEventListener('animationend', () => {
            tile.classList.remove('shake')
        }, { once: true })
    })
}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]')
}

createKeyboard()
createGrid()

startInteraction()
