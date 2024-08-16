import numpy as np
from scipy.stats import norm as N

class Option:
    def __init__(self,S, K, T, r, sigma, option_type="call", option_action="buy",quantity=0):
        self.S = S
        self.K = K
        self.T = T
        self.r = r
        self.sigma = sigma
        self.option_type = option_type
        self.option_action = option_action
        self.quantity = quantity

    def __str__(self):
        return (f"Option(type={self.option_type}, action={self.option_action}, quantity={self.quantity}, "
                f"S={self.S}, K={self.K}, T={self.T}, r={self.r}, sigma={self.sigma})")

    
    def d1(self):
        return (np.log(self.S / self.K) + (self.r + (self.sigma**2) / 2) * self.T) / (self.sigma * np.sqrt(self.T))
    
    def d2(self):
        return self.d1() - self.sigma*np.sqrt(self.T)
    
    def call(self):
        return self.S * N.cdf(self.d1()) - self.K*np.exp(-self.r * self.T) * N.cdf(self.d2())
    
    def put(self):
        return  self.K*np.exp(-self.r * self.T) * N.cdf(-self.d2()) - self.S * N.cdf(-self.d1())
    
    def calculate_premium(self):
        if self.option_type == "Call":
            return self.call()
        elif self.option_type == "Put":
            return self.put()

    def greeks(self):
        """DELTA - the rate of change of the option price w.r.t the price of the underlying asset."""
        delta_call = N.cdf(self.d1())
        delta_put = delta_call -1

        """GAMMA - the rate of change of the portfolio's delta w.r.t the price of the underlying asset"""
        gamma = N.pdf(self.d1()) / (self.S * self.sigma * np.sqrt(self.T))

        """VEGA - the rate of change of the value of the portfolio w.r.t the volatility of the underlying asset."""
        vega = self.S * np.sqrt(self.T)*N.pdf(self.d1())

        """THETA - the rate of change of the value of the portfolio w.r.t the passage of time with all else remaining the same."""
        theta_call = (-self.S * N.pdf(self.d1()) * self.sigma) / (2 * np.sqrt(self.T)) - (self.r * self.K * np.exp(-self.r * self.T) * N.cdf(self.d2()))
        theta_put = theta_call + self.r * self.K * np.exp(-self.r * self.T)

        """RHO - the rate of change of the value of the portfolio w.r.t the interest rate"""
        rho_call = self.K * self. T * np.exp(-self.r * self.T)*N.cdf(self.d2())
        rho_put = -self.K * self. T * np.exp(-self.r * self.T)*N.cdf(-self.d2())

        return {
            'delta_call': delta_call,
            'delta_put':  delta_put,
            'gamma': gamma,
            "vega": vega,
            'theta_call': theta_call,
            'theta_put': theta_put,
            'rho_call': rho_call,
            'rho_put': rho_put
        }

    def calc_all(self):
        return {
            'call': self.call(),
            'put' : self.put(),
            'greeks': self.greeks()
        }
    

class OptionArray:
    def __init__(self,options_array):
        self.options_array = options_array
        self.payoffs = {}

    
    def generate_zero_array(self):
        max_S = 0
        for opt in self.options_array:
            max_S = max(opt.S, max_S)
        return np.zeros(shape = (len(self.options_array),max_S*2))
    
    def calculate_premiums(self):
        return {f"option_premium_{i+1}": opt.calculate_premium() for i, opt in enumerate(self.options_array)}
        

    
    def calculate_profit(self):
        self.payoff_array = self.generate_zero_array()
        
        for i, opt in enumerate(self.options_array):
            if opt.option_type == "Call":
                if opt.option_action == "Buy":
                    print(opt)
                    print(opt.call())
                    self.payoff_array[i] = np.array([max(stock_price - opt.K,0) - opt.call() for stock_price in range(len(self.payoff_array[i]))])
                    print(opt.call())
                elif opt.option_action =="Sell":
                    self.payoff_array[i] = np.array([min(opt.K - stock_price,0) + opt.call() for stock_price in range(len(self.payoff_array[i]))])

            elif opt.option_type =="Put":
                if opt.option_action == "Buy":
                    self.payoff_array[i] = np.array([max(opt.K - stock_price,0) - opt.put() for stock_price in range(len(self.payoff_array[i]))])
                elif opt.option_action =="Sell":
                    self.payoff_array[i] = np.array([min(stock_price - opt.K,0) + opt.put() for stock_price in range(len(self.payoff_array[i]))]) 

            elif opt.option_type == "Stock":
                if opt.option_action == "Buy":
                    self.payoff_array[i] = np.array([stock_price - opt.S for stock_price in range(len(self.payoff_array[i]))])
                elif opt.option_action == "Sell":
                    self.payoff_array[i] = np.array([opt.S - stock_price for stock_price in range(len(self.payoff_array[i]))])


        
        
        payoff_dict = {f"payoff_strat_{i+1}" : payoff.tolist() for i,payoff in enumerate(self.payoff_array)}
        payoff_dict["total_profit"] = self.payoff_array.sum(axis=0).tolist()
        return payoff_dict
                    


###Goals now
### Make update dynamically
### Make graph look better (use apex charts)
### Add stock hold position
### Add text everywhere to explain what is going on -- probably require seperate explanation class takes option_type etc. or just make seperate web pages for each strategy.