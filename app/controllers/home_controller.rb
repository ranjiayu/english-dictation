class HomeController < ApplicationController
  def index
    @version = Rails.application.config_for(:app).version
    @materials = Rails.application.config_for(:app).dict
  end

  def about
    @version = Rails.application.config_for(:app).version
  end

  def login
  end
end
