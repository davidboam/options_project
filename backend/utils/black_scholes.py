import numpy as np
from scipy.stats import norm as N

class Option:
    def __init__(self,S, K, T, r, sigma):
        self.S = S
        self.K = K
        self.T = T
        self.r = r
        self.sigma = sigma

    
    def d1(self):
        return (np.log(self.S / self.K) + (self.r + (self.sigma**2) / 2) * self.T) / (self.sigma * np.sqrt(self.T))
    
    def d2(self):
        return self.d1() - self.sigma*np.sqrt(self.T)
    
    def call(self):
        return self.S * N.cdf(self.d1()) - self.K*np.exp(-self.r * self.T) * N.cdf(self.d2())
    
    def put(self):
        return  self.K*np.exp(-self.r * self.T) * N.cdf(-self.d2()) - self.S * N.cdf(-self.d1())
    
    def greeks(self):
        """DELTA - the rate of change of the option price w.r.t the price of the underlying asset."""
        delta_call = N.cdf(self.d1())
        delta_put = delta_call -1

        """THETA - the rate of change of the value of the portfolio w.r.t the passage of time with all else remaining the same."""
        theta_call = (-self.S * N.pdf(self.d1()) * self.sigma) / (2 * np.sqrt(self.T)) - (self.r * self.K * np.exp(-self.r * self.T) * N.cdf(self.d2()))
        theta_put = theta_call + self.r * self.K * np.exp(-self.r * self.T)

        """GAMMA - the rate of change of the portfolio's delta w.r.t the price of the underlying asset"""
        gamma = N.pdf(self.d1()) / (self.S * self.sigma * np.sqrt(self.T))
        
        """VEGA - the rate of change of the value of the portfolio with respect to the volatility of the underlying asset."""
        vega = self.S * np.sqrt(self.T)*N.pdf(self.d1())
        return {
            'delta_call': delta_call,
            'delta_put':  delta_put,
            'theta_call': theta_call,
            'theta_put': theta_put,
            'gamma': gamma,
            "vega": vega
        }

    def calc_all(self):
        return {
            'call': self.call(),
            'put' : self.put(),
            'greeks': self.greeks()
        }


