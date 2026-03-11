# Lab 2 — Days Generator Library

Бібліотека JavaScript, яка надає генератор нескінчених днів тижня та ітератор з таймером.

## Структура проєкту
```
lab2/
    days-generator-lib/       
        src/
            daysGenerator.js
            iterateWithTimeout.js
            index.js
        README.md
        LICENSE
        package.json
        .gitignore
    days-generator-example/    
        index.js
        package.json
```

## Встановлення
```
cd days-generator-example
npm install
```

## Запуск
```
cd days-generator-example
node index.js
```

### `daysGenerator()`
Нескінчений генератор, який перебирає дні тижня (Monday → Sunday) циклічно.
```
const { daysGenerator } = require("days-generator-lib");
const gen = daysGenerator();
console.log(gen.next().value); // "Monday"
console.log(gen.next().value); // "Tuesday"
```

### `iterateWithTimeout(iterator, seconds, [onValue], [onEnd])`
Викликає `iterator.next()` щосекунди та зупиняється через вказану кількість секунд.

| Parameter  | Type       | Description                                          |
|------------|------------|------------------------------------------------------|
| `iterator` | `Iterator` | Будь-який JS ітератор або генератор                  |
| `seconds`  | `number`   | Тривалість у секундах                                |
| `onValue`  | `function` | Необов'язковий callback `(iteration, value) => void` |
| `onEnd`    | `function` | Необов'язковий callback `(reason) => void`           |
```
const { daysGenerator, iterateWithTimeout } = require("days-iterator-lib");
const gen = daysGenerator();
iterateWithTimeout(gen, 5);
```

## Ліцензія
MIT
