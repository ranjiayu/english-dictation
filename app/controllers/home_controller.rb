class HomeController < ApplicationController
  def index
    @version = Rails.application.config_for(:app).version
  end

  def about
    @version = Rails.application.config_for(:app).version
  end
end
