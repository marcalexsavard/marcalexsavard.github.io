@( @ionic -v >nul && ( 
	@echo Ionic installed. 
) || ( 
	@echo Installing Ionic...
	npm install -g @ionic/cli
)) && (
	@echo Installing react-scripts...
	npm i -D -E react-scripts
	@echo Installing react-joystick-component
	npm i react-joystick-component
	@echo Installing react-device-detect
	npm i react-device-detect
	@echo Installing react-range
	npm i react-range
	@echo Installing recharts
	npm i recharts
)