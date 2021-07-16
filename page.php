<?php 
$titulo = 'Retorno Fies';
if(@$tipo = $_GET['tp']){
	if($tipo == 1){
		$titulo .= ' - Coparticipação';
	}
}else{
	$tipo 	= 2;
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="pt-br" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo $titulo; ?></title>

<!-- CSS -->
<link rel="stylesheet" href="api/bootstrap/bootstrap.min.css" type="text/css" media="all">
<link rel="stylesheet" href="api/jquery/jquery.bootgrid.css" >
<link rel="stylesheet" href="view/style.css">

<!-- JS -->
<script src="api/jquery/jquery-1.11.1.min.js"></script>
<script src="api/bootstrap/bootstrap.min.js"></script>
<script src="api/jquery/jquery.bootgrid.min.js"></script>
<script src="api/text-encoding/encoding-indexes.js"></script>
<script src="api/text-encoding/encoding.js"></script>

</head>

<body>
	<!-- Informações em geral -->
	<input id="in_tp" type="hidden" value="<?php echo $tipo; ?>"/>
	<!-- Alerta Mensagem -->
    <div class="alert" id="msg" style="display:none;">
	  	<a href="#" class="close">&times;</a>
  		<strong id="id_tx">Erro! </strong><label id="msg_tx"></label>
  	</div>

	<!-- Modal Mensagem -->
    <div class="modal fade" id="msgModal">
    	<div class="modal-dialog">
        	<div class="modal-content">
                <div class="modal-header">
               		<h5 class="titulo">Titulo</h4>
      				<button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
            	<div class="modal-body">
                	<div class="form-group">
                      <div id="modalbadyimg"></div>
                  	</div>
                    <div class="form-group text-center">
                    	<h5 id="modalbadytext"></h5>
                    </div>
                	<div class="texto"></div>
                </div>
                <div class="modal-footer">
                	<button type="button" id="sv" class="btn btn-primary" data-dismiss="modal"><h7>Continuar</h7></button>
                    <button type="button" id="ok" class="btn btn-primary" data-dismiss="modal"><h7>OK</h7></button>
                	<button type="button" id="cl" class="btn btn-secondary" data-dismiss="modal"><h7>Cancelar</h7></button>
				</div>
            </div>
        </div>
    </div>
	
	<!-- Modal Alt Data de Cred. -->
    <div class="modal fade" id="crdModal">
    	<div class="modal-dialog">
        	<div class="modal-content">
                <div class="modal-header">
               		<h5 class="titulo">Alt. data de Credito</h4>
      				<button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
            	<div class="modal-body">
                	<div class="form-group">
						<label for="recipient-name" class="col-form-label">Data Errada:</label>
						<input type="date" class="form-control" id="dtErro">
					</div>
					
                    <div class="form-group">
						<label for="recipient-name" class="col-form-label">Data Certa:</label>
						<input type="date" class="form-control" id="dtOk">
					</div>

                </div>
                <div class="modal-footer">
                	<button type="button" class="btn btn-primary" data-dismiss="modal" onclick="altDtCred();"><h7>Corrigir</h7></button>
                	<button type="button" id="cl" class="btn btn-secondary" data-dismiss="modal"><h7>Cancelar</h7></button>
				</div>
            </div>
        </div>
    </div>

	<div class="container">
	<div class="page">
    	<div class="form">
        	<div><span class="iconMais icon-cad"></span><h1><?php echo $titulo; ?></h1></div>
			<div class="pull-right" style="padding-left:10px;">
				<button type="button" class="btn btn-xs btn-info" data-toggle="modal" data-target="#crdModal"><span class="glyphicon glyphicon-share"></span> Alterar data de Credito</button>
			</div>
			
			<a href="index.php">
				<div class="pull-right" style="padding-left:10px;">
					<button type="button" class="btn btn-xs btn-info"><span class="glyphicon glyphicon-share"></span> Voltar</button>
				</div>
			</a>
        </div>
        <div class="form">
			<div id="drop">Solte ou selecione um arquivo de planilha aqui para iniciar o processamento</div>
			<div class="progress">
				<div class="progress-bar progress-bar-success progress-bar-striped active" id="barraProgesso" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">1%</div>
				<input id="fl_in" type="file" value="upload" style="display:none;" />
			</div>
			<div id="htmlout" class="well clearfix">Log do Resultado</div>
        </div>
    </div>
    </div>
    
<!-- Optional JavaScript -->
<script src="api/excel/xlsx.js"></script>				
<script src="api/fileSaver/dist/FileSaver.min.js"></script>
<script src="view/retornoFies/interacao.js"></script>
</body>
</html>