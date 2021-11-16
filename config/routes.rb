Rails.application.routes.draw do
  root "home#index"
  get 'home/index'
  get 'home/about'
  get 'home/login'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
