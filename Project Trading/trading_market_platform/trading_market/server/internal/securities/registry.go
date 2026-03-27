package securities

import (
	"fmt"
	"sync"
)

// Security represents a financial instrument listed on the platform.
type Security struct {
	Symbol      string
	Name        string
	Description string
	FaceValue   float64
	TotalSupply int64
	Currency    string
	Sector      string
}

// Registry holds all listed securities.
type Registry struct {
	mu         sync.RWMutex
	securities map[string]*Security
}

func NewRegistry() *Registry {
	r := &Registry{
		securities: make(map[string]*Security),
	}
	r.seed()
	return r
}

// seed loads the company's own securities.
func (r *Registry) seed() {
	listing := []*Security{
		{
			Symbol:      "MYCO-A",
			Name:        "MyCompany Class A Share",
			Description: "Voting common shares of MyCompany Ltd.",
			FaceValue:   10_000,
			TotalSupply: 1_000_000,
			Currency:    "IDR",
			Sector:      "Financial Services",
		},
		{
			Symbol:      "MYCO-B",
			Name:        "MyCompany Class B Share",
			Description: "Non-voting preferred shares of MyCompany Ltd.",
			FaceValue:   5_000,
			TotalSupply: 2_000_000,
			Currency:    "IDR",
			Sector:      "Financial Services",
		},
		{
			Symbol:      "MYCO-C",
			Name:        "MyCompany Sukuk Bond 2027",
			Description: "3-year Islamic bond maturing 2027.",
			FaceValue:   2_500,
			TotalSupply: 5_000_000,
			Currency:    "IDR",
			Sector:      "Fixed Income",
		},
		{
			Symbol:      "MYCO-D",
			Name:        "MyCompany Growth Fund Unit",
			Description: "Unit participation in the MyCompany Growth Fund.",
			FaceValue:   1_000,
			TotalSupply: 10_000_000,
			Currency:    "IDR",
			Sector:      "Investment Fund",
		},
	}
	for _, s := range listing {
		r.securities[s.Symbol] = s
	}
}

func (r *Registry) List() []*Security {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]*Security, 0, len(r.securities))
	for _, s := range r.securities {
		cp := *s
		out = append(out, &cp)
	}
	return out
}

func (r *Registry) Get(symbol string) (*Security, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	s, ok := r.securities[symbol]
	if !ok {
		return nil, fmt.Errorf("security %q not found", symbol)
	}
	cp := *s
	return &cp, nil
}

func (r *Registry) Exists(symbol string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	_, ok := r.securities[symbol]
	return ok
}
