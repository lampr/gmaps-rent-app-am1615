require 'sinatra'
require 'shotgun' if development?

require 'json'
require 'rack/csrf'
require 'mongoid'
require 'securerandom'

before do
  redirect request.url.sub(/www\./, ''), 301 if request.host =~ /^www/
end


configure do  
  use Rack::Session::Cookie, :secret => "i7Unx_ssdDG21io6cxN2eGS-KL"
  use Rack::Csrf, :raise => true
end



# Load mongolab db
Mongoid.load!("mongoid.yml")

#GeoIP 
class Marker
  include Mongoid::Document 
  field :marker_id
  field :lat
  field :lng
  field :tel
  field :address
  field :description
  field :room_type
  field :photo_id

  
  def self.create_marker(id, lat, lng, tel, address, desc, room_type, photo_id)
    create(
      :marker_id => id,
      :lat => lat,
      :lng => lng,
      :tel => tel,
      :address => address,
      :description => desc,
      :room_type => room_type,
      :photo_id => photo_id
    )
  end
  
#  def self.remove_token(token)
#    @d = Marker.where(:token => token).first
#    @d.destroy
#  end
end


#roots
get '/' do
  @markers = Marker.all
  erb :map
end 

get '/panel' do  
  protected!
  @panel = "include-app-js"
  erb :panel  
end

get '/:unkown' do
    'not found'
end 


get '/markers/all' do
  protected!
  @markers = Marker.all
  erb :all_markers
end  

post '/marker/save' do
	lat = params[:lat]
	lng = params[:lng] 
	address = params[:address] 
  tel = params[:tel] 
  desc = params[:desc] 
  room_type = params[:room_type] 
  photo_id = params[:photo_id] 

  id = rand(32**4).to_s(32)

#  @exist = Marker.where(:hash => hash).first
#  if @exist
#    content_type :json
#      {:status => 400, :error => "hash exists." }.to_json
#  else
    @marker = Marker.create_marker(id, lat, lng, tel, address, desc, room_type, photo_id)
    content_type :json
      {:status => 200, :id => id }.to_json
#  end
  

end


# Upload images 
post '/upload/image' do
  image = params[:image_file][:tempfile]
  ext = get_extension(params[:image_file][:type])
  @filename = SecureRandom.urlsafe_base64(9) + "-img." + ext
  File.open("./public/assets/#{@filename}", 'wb') do |f|
    f.write(image.read)
  end
  # Json Response
  content_type :json 
    { :upload => "success", :photo_id => "#{@filename}" }.to_json
end


post '/api' do
  @api_key = params[:api_key]
  @mail = params[:mail]
  
  content_type :json
  	{:status => 200, :key => @api_key, :mail => @mail }.to_json 
end


# HELPERS
helpers do
  def get_extension(extension)
    if extension == "image/jpeg" 
      return "jpg"
    else extension == "image/png" 
      return "png"
    end     
  end


  def csrf_tag
    Rack::Csrf.csrf_tag(env)
  end

  def protected!
    unless authorized?
      response['WWW-Authenticate'] = %(Basic realm="Restricted Area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def authorized?
    @auth ||=  Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? && @auth.basic? && @auth.credentials && @auth.credentials == ['zztop', 'secret1']
  end

end  

































