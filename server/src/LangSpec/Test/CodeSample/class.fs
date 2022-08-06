class Calculator {
    var name = 'Hello calculator';

    func add(a, b) {
        return a + b;
    }

    func min(a, b) {
        return a - b;
    }

    func abs(a) {
        if (a < 0) {
            return -a;
        }
        return a;
    }

    func mul(a, b) {
        for (var i = 0; i < a; i = i + 1) {
            b += 1;
        }
        return b;
    }
}