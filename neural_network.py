import numpy as np

class NeuralNetwork:
    def __init__(self, layer_sizes):
        """layer_sizes: list of ints, e.g. [2, 4, 1] = 2 inputs, 4 hidden, 1 output"""
        self.weights = []
        self.biases = []
        for i in range(len(layer_sizes) - 1):
            w = np.random.randn(layer_sizes[i], layer_sizes[i+1]) * 0.1
            b = np.zeros((1, layer_sizes[i+1]))
            self.weights.append(w)
            self.biases.append(b)

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

    def sigmoid_deriv(self, x):
        s = self.sigmoid(x)
        return s * (1 - s)

    def forward(self, X):
        self.activations = [X]
        self.z_vals = []
        a = X
        for w, b in zip(self.weights, self.biases):
            z = a @ w + b
            self.z_vals.append(z)
            a = self.sigmoid(z)
            self.activations.append(a)
        return a

    def backward(self, X, y, lr=0.1):
        m = X.shape[0]
        output = self.activations[-1]
        delta = (output - y) * self.sigmoid_deriv(self.z_vals[-1])

        for i in reversed(range(len(self.weights))):
            dw = self.activations[i].T @ delta / m
            db = delta.mean(axis=0, keepdims=True)
            if i > 0:
                delta = delta @ self.weights[i].T * self.sigmoid_deriv(self.z_vals[i-1])
            self.weights[i] -= lr * dw
            self.biases[i] -= lr * db

    def train(self, X, y, epochs=1000, lr=0.1):
        for epoch in range(epochs):
            self.forward(X)
            self.backward(X, y, lr)
            if epoch % 200 == 0:
                loss = np.mean((self.activations[-1] - y) ** 2)
                print(f"Epoch {epoch:4d} | Loss: {loss:.4f}")

    def predict(self, X):
        return self.forward(X)


if __name__ == "__main__":
    # XOR problem: classic non-linear classification task
    X = np.array([[0,0],[0,1],[1,0],[1,1]])
    y = np.array([[0],[1],[1],[0]])

    nn = NeuralNetwork([2, 4, 1])
    print("Training on XOR...\n")
    nn.train(X, y, epochs=1000, lr=0.5)

    print("\nPredictions:")
    preds = nn.predict(X)
    for xi, yi, pi in zip(X, y, preds):
        print(f"  Input: {xi} | Target: {yi[0]} | Predicted: {pi[0]:.4f}")
