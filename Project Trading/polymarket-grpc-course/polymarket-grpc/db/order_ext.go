package db

import (
	"fmt"
	"time"

	"github.com/polymarket-grpc/models"
)

// Update persists changes to an existing order.
func (s *OrderStore) Update(o *models.Order) (*models.Order, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.orders[o.ID]; !ok {
		return nil, fmt.Errorf("order %s not found", o.ID)
	}
	o.UpdatedAt = time.Now()
	s.orders[o.ID] = o
	return o, nil
}
